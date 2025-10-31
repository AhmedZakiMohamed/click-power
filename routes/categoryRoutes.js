const express = require('express');
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

router.route('/:id/products').get(categoryController.getProductsByCategory);

// Routes accessible only by admin
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// CRUD routes
router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router
  .route('/withProductCount')
  .get(categoryController.getCategoriesWithProductCount);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
