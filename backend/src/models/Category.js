import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  isAccessory: {
    type: Boolean,
    default: false,
  },
  showInMobileSpareParts: {
    type: Boolean,
    default: false,
  },
  showInAccessories: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
