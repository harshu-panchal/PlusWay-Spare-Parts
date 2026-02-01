import mongoose from 'mongoose';

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
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
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
  },
  colors: [{
    type: String,
  }],
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
