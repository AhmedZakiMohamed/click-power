// routes/categories.js
const express = require("express");
const Category = require("../models/category");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// 1. جلب كل الكاتيجوريات (قائمة)
exports.getAllCategories = catchAsync(async (req, res) => {
  const cats = await Category.find().sort("name");
  res.json(cats);
});
exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});
exports.getCategoriesWithProductCount = catchAsync(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "categories",
        as: "products",
      },
    },
    {
      $addFields: {
        productCount: { $size: "$products" },
      },
    },
    {
      $project: {
        products: 0, // علشان ما ترجعش كل المنتجات
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});


exports.createCategory = catchAsync(async (req, res) => {
  const newCats = await Category.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      category: newCats,
    },
  });
});
exports.updateCategory = catchAsync(async (req, res, next) => {
  const cats = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return updated document
    runValidators: true, // validate before saving
  });

  if (!cats) {
    return next(new AppError("No category found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      category: cats,
    },
  });
});
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const cats = await Category.findByIdAndDelete(req.params.id);
  if (!cats) {
    return next(new AppError("No category found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// 2. جلب موديلات كاتيجوري محددة مع pagination و filter
exports.getProductsByCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const page = Math.max(1, parseInt(req.query.page || 1));
  const limit = Math.min(50, parseInt(req.query.limit || 12));
  const skip = (page - 1) * limit;
  const { q, minPrice, maxPrice, sort } = req.query;

  // بنبني فلتر
  const filter = { categories: id };
  if (q) filter.name = { $regex: q, $options: "i" };
  if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort || "-createdAt")
      .select("name price imageCover images summary slug sku"), // ✅ ضفت slug هنا
    Product.countDocuments(filter),
  ]);

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  });
});