const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
    },
    categories: [{ type: mongoose.Schema.ObjectId, ref: 'Category' }],

    slug: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A product must have a summary'],
    },
    imageCover: {
      type: String,
    },
    images: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
productSchema.index(
  { sku: 1 },
  {
    unique: true,
    partialFilterExpression: { sku: { $exists: true, $ne: null } },
  },
);

// Indexes
productSchema.index({ price: 1 });
productSchema.index({ slug: 1 });

// Slug middleware
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//  Virtual field — عشان يجيب أسماء الكاتيجوريات لو متعمّلة populate
productSchema.virtual('categoryNames').get(function () {
  // لو الـ categories اتعملها populate (يعني بقت objects مش IDs)
  if (
    this.categories &&
    this.categories.length > 0 &&
    this.categories[0].name
  ) {
    return this.categories.map((cat) => cat.name);
  }
  return [];
});
productSchema.pre('save', async function (next) {
  if (!this.sku) {
    // خد أول 3 حروف من اسم المنتج (بالحروف الكبيرة)
    const prefix = this.name ? this.name.slice(0, 3).toUpperCase() : 'PRD';

    // رقم عشوائي بسيط أو آخر 5 أرقام من ObjectId
    const randomPart = this._id.toString().slice(-5).toUpperCase();

    // ركّب الكود
    this.sku = `${prefix}-${randomPart}`;
  }
  next();
});

module.exports =
  mongoose.models.Product || mongoose.model('Product', productSchema);
