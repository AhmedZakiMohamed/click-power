const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = express.Router();


router.use(viewController.showAlert);


router.use(authController.isLoggedIn);

// Public routes
router.get("/", viewController.getHome);
router.get("/About", viewController.getAbout);
router.get("/contact", viewController.getContact);
router.get("/cards", viewController.getCards);
router.get("/product/:slug", viewController.getDetails);
router.get("/mangeApp", authController.protect, viewController.getDashBoard);

// Auth routes
router.get("/login", viewController.getLoginForm);
router.get("/signup", viewController.getSignupForm);

// Password reset
router.get("/resetLink", viewController.getForgotPasswordForm);
router.get("/resetPassword/:token", viewController.getResetPasswordForm);

// Protected routes
router.get("/account", authController.protect, viewController.getAccount);
router.post("/submit-user-data", authController.protect, viewController.updateUserData);

module.exports = router;
