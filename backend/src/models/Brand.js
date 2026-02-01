import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  logo: {
    type: String,
  },
  models: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
  }],
}, {
  timestamps: true,
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
