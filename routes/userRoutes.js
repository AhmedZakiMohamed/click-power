const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { createSendToken } = require('../controllers/authController');
const passport = require('passport');
const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);


const { createSendTokenAndRedirect } = require('../controllers/authController');

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    console.log('🟣 Google redirect route hit');

    createSendTokenAndRedirect(req.user, res, '/');
  },
);

router.use(authController.protect);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  authController.protect,

  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
); //!هنا هنضيف الحجاا الخاصه باننا نضيف صوره
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
