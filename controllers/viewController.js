const Product = require('../models/productModel');
const User = require('../models/userModel');
const Category = require('../models/category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getHome = (req, res) => {
  // ✅ Debug: شوف الـ user
  console.log('🟢 res.locals.user:', res.locals.user);
  console.log('🟢 req.cookies:', req.cookies);

  res.status(200).render('home', {
    title: 'Home',
    user: res.locals.user, // ✅ مهم جداً
  });
};

exports.getAbout = (req, res) => {
  res.status(200).render('about', {
    title: 'About',
    user: res.locals.user, // ✅ مهم جداً
  });
};

exports.getContact = (req, res) => {
  res.status(200).render('contact', {
    title: 'Contact',
    user: res.locals.user, // ✅ مهم جداً
  });
};

exports.getCards = catchAsync(async (req, res, next) => {
  const products = await Product.find();
  const categories = await Category.find();

  res.status(200).render('cards', {
    title: 'Products',
    products,
    categories,
    user: res.locals.user, // ✅ مهم جداً
  });
});

exports.getDetails = catchAsync(async (req, res, next) => {
  let product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new AppError('No product found with that name', 404));
  }

  // Populate بعد كده
  product = await product.populate('categories');

  console.log('Product Data:', product);
  console.log('Categories:', product.categories);
  console.log('Categories Type:', typeof product.categories);
  console.log('Is Array?:', Array.isArray(product.categories));

  res.status(200).render('productTemp', {
    title: product.name,
    product,
    user: res.locals.user,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user || res.locals.user, // ✅ من protect middleware أو isLoggedIn
  });
};

exports.getLoginForm = (req, res) => {
  // ✅ لو المستخدم مسجل دخول، وجهه للـ account بدل home
  if (res.locals.user) {
    return res.redirect('/account');
  }

  res.status(200).render('login', {
    title: 'Log into your account',
    user: res.locals.user,
  });
};

exports.getSignupForm = (req, res) => {
  // ✅ لو المستخدم مسجل دخول، وجهه للـ account
  if (res.locals.user) {
    return res.redirect('/account');
  }

  res.status(200).render('signup', {
    title: 'Create your account',
    user: res.locals.user,
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user,
  });
});

exports.getForgotPasswordForm = (req, res) => {
  res.status(200).render('resetLink', {
    title: 'Forgot Password',
    user: res.locals.user,
  });
};

exports.getResetPasswordForm = (req, res) => {
  res.status(200).render('forgotPass', {
    title: 'Reset Password',
    token: req.params.token,
  });
};

exports.showAlert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'signupSuccess') {
    res.locals.alert =
      'Success! You have signed up. Please check your email for verification.';
  }
  next();
};
// controllers/yourController.js
exports.getDashBoard = catchAsync(async (req, res, next) => {
  // 🟢 جلب كل التصنيفات ومعاها عدد المنتجات في كل تصنيف
  const categoriesWithCount = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'categories',
        as: 'products',
      },
    },
    {
      $addFields: {
        productCount: { $size: '$products' },
      },
    },
    {
      $project: {
        products: 0, // نخفي المنتجات نفسها
      },
    },
  ]);

  // 🟢 جلب جميع المنتجات
const products = await Product.find().populate('categories', 'name');

  // 🟢 حساب الإجماليات
  const totalProducts = products.length;
  const totalCategories = categoriesWithCount.length;

  // 🔍 للتأكد أن البيانات تمام
  console.log('✅ categoriesWithCount:', categoriesWithCount);
  console.log('✅ totalProducts:', totalProducts);
  console.log('✅ totalCategories:', totalCategories);

  // 🟢 إرسال البيانات للـ View
  res.status(200).render('mangeApp', {
    title: 'Dashboard',
    user: res.locals.user,
    categories: categoriesWithCount,
    products,
    totalProducts,
    totalCategories,
  });
});