const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const config = require('../config');
const Email = require('../utils/email');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('../controllers/authController');

// Helper function to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwtCookieExpiresIn * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'none', // 🔥 لازم كده علشان الكوكي تشتغل من دومين تاني أو HTTPS
    secure: config.env === 'production', // 🔒 تبقى true في Render
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};


exports.createSendTokenAndRedirect = (user, res, redirectPath = '/') => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + config.jwtCookieExpiresIn * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  };
  if (config.env === 'production') cookieOption.secure = true;

  // أرسل الكوكي
  res.cookie('jwt', token, cookieOption);
  user.password = undefined;

  // بعد كده Redirect
  res.redirect(redirectPath);
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  console.log('✅ User created:', newUser);

  const url = `${req.protocol}://${req.get('host')}/account`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, req);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  const decoded = await promisify(jwt.verify)(token, config.jwtSecret);
  //check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }
  // check if user changed password after the token was issued
  if (await currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }
  //هنا في الاخر لو كل الحاجات دي متحققه بيعرض البيانت بتاعة اليوزر

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  console.log('🔍 isLoggedIn middleware triggered');
  console.log('🔍 Cookies:', req.cookies);

  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        config.jwtSecret,
      );
      console.log('✅ Token verified, decoded:', decoded);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        console.log('❌ User not found');
        return next();
      }
      console.log('✅ User found:', currentUser.email);

      // 3) Check if user changed password after token was issued
      // ✅ المشكلة كانت هنا - لازم await
      if (await currentUser.changePasswordAfter(decoded.iat)) {
        console.log('❌ Password changed after token issued');
        return next();
      }

      // 4) There is a logged in user
      res.locals.user = currentUser;
      console.log('✅ res.locals.user set:', res.locals.user.email);
      return next();
    } catch (err) {
      console.error('❌ isLoggedIn error:', err.message);
      return next();
    }
  }

  console.log('⚠️ No JWT cookie found');
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //2) Generate the random reset token
  const recentlyCreatedToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) send it to user email
  try {
    const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${recentlyCreatedToken}`;

    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2)   //2) if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) update changedPasswordAt property for the user
  //4) log the user in, send JWT
  createSendToken(user, 200, res);
});
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id,
      clientSecret: config.google_client_secret,
      callbackURL: 'http://localhost:4000/api/v1/users/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, cb) => {
      console.log('🟢 Google callback triggered');

      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        // لو المستخدم موجود خلاص
        if (existingUser) return cb(null, existingUser);

        // لو مستخدم جديد
        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
          role: 'user',
        });

        // ✅ هنا نبعت إيميل الترحيب
        const url = `${req.protocol}://${req.get('host')}/me`;
        console.log('📧 Sending welcome email to:', newUser.email);
        try {
          await new Email(newUser, url).sendWelcome();
          console.log('✅ Email sent successfully!');
        } catch (err) {
          console.error('❌ Email sending failed:', err);
        }

        return cb(null, newUser);
      } catch (err) {
        console.error('❌ Google login error:', err);
        return cb(err);
      }
    },
  ),
);

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) check if posted current password is correct password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4) log user in, send JWT
  createSendToken(user, 200, res);
});
exports.createSendToken = createSendToken;
