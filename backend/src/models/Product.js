import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer', // referencing Customer model instead of User
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminReply: { type: String },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    unique: true,
    sparse: true,
  },
  description: [{
    type: String,
  }],
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  wholesalePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  wholesaleMinQty: {
    type: Number,
    required: true,
    default: 10,
  },
  mrp: {
    type: Number,
    required: true,
    default: 0,
  },
  cashback: {
    type: Number,
    default: 0,
  },
  reviews: [reviewSchema],
  images: [{
    type: String,
  }],
  videoUrl: {
    type: String,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  productType: {
    type: String, // e.g., "LCD with Touch Screen", "Battery"
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
  },
  details: {
    specs: [{
      key: String,
      value: String
    }],
    inTheBox: {
      type: String,
      default: ""
    },
    warranty: {
      period: String, // e.g., "30 Days"
      policy: String, // e.g., "Replacement"
      summary: String // e.g., "Warranty not applicable if..."
    },
    highlights: [{ type: String }], // Quick bullet points
    descriptionPoints: [{ type: String }], // Multiple description points
  },
  colors: [{
    type: String,
  }],
  colorVariants: [{
    colorName: { type: String, required: true },
    images: [{ type: String }],
  }],
}, {
  timestamps: true,
});

// Add indexes for performance
productSchema.index({ name: 'text' }); // Text index for name search
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ model: 1 });
productSchema.index({ productType: 1 });
productSchema.index({ countInStock: 1 }); // Useful for filtering out-of-stock items if needed

const Product = mongoose.model('Product', productSchema);

export default Product;
