const Product = require('../models/productModel');
const Category = require('../models/category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

//upload images
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  // ← file مش fileLoader
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizeProductImages = catchAsync(async (req, res, next) => {
  // ✅ تأكد من وجود الصور
  if (!req.files || !req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  const productId =
    req.body.name.replace(/\s+/g, '-').toLowerCase() || 'product'; // لو مفيش ID بعد
  req.body.imageCover = `product-${productId}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  if (req.files.images) {
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `product-${productId}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/products/${filename}`);
        req.body.images.push(filename);
      }),
    );
  }

  next();
});
exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.fields = 'name,price,,summary';
  next();
};

// Get all products
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const product = await Product.find();
  res.status(200).json({
    status: 'success',
    results: product.length,
    data: {
      product,
    },
  });
});

// Get single product
exports.getProduct = catchAsync(async (req, res, next) => {
  // Populate categories بحيث تجيب الاسم بدل الـ ObjectId
  const product = await Product.findById(req.params.id).populate(
    'categories',
    'name',
  );

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Create product
exports.createProduct = catchAsync(async (req, res, next) => {
  console.log('🔵 createProduct - req.body:', req.body);
  console.log('🔵 createProduct - req.files:', req.files);
  
  // ✅ تحقق من البيانات الأساسية
  if (!req.body.name || !req.body.description || !req.body.summary) {
    return next(new AppError('Please provide name, description, and summary', 400));
  }
  
  let categoryIds = [];

  // ✅ لو مفيش categories خالص
  if (!req.body.categories) {
    req.body.categories = [];
  }
  
  // ✅ لو string، حوله لـ array
  if (typeof req.body.categories === 'string') {
    req.body.categories = [req.body.categories];
  }

  // ✅ لو فيه categories
  if (req.body.categories && req.body.categories.length > 0) {
    // تحقق لو ObjectId (24 حرف hex)
    const isObjectId = req.body.categories[0].match(/^[0-9a-fA-F]{24}$/);
    
    console.log('🔍 First category:', req.body.categories[0]);
    console.log('🔍 Is ObjectId?', isObjectId);
    
    if (isObjectId) {
      // ✅ لو ObjectId، استخدمه مباشرة
      categoryIds = req.body.categories;
      console.log('✅ Using ObjectIds directly:', categoryIds);
    } else {
      // ✅ لو اسم، دور عليه
      const categories = await Category.find({
        name: { $in: req.body.categories },
      });
      
      console.log('🔍 Found categories:', categories);
      
      if (!categories.length) {
        return next(
          new AppError('No categories found with the given names', 400),
        );
      }
      categoryIds = categories.map((cat) => cat._id);
    }
  }

  console.log('🔵 Final categoryIds:', categoryIds);

  const newProduct = await Product.create({
    name: req.body.name,
    description: req.body.description,
    summary: req.body.summary,
    categories: categoryIds,
    imageCover: req.body.imageCover,
    images: req.body.images,
    // أضف باقي الحقول لو موجودة
    price: req.body.price,
    // ... إلخ
  });

  const populatedProduct = await Product.findById(newProduct._id).populate(
    'categories',
    'name',
  );

  res.status(201).json({
    status: 'success',
    data: {
      product: populatedProduct,
    },
  });
});
// Update product
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return updated document
    runValidators: true, // validate before saving
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});
//delete product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
