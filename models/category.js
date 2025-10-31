const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", CategorySchema);
