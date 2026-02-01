import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  released: String,
  displaySize: String,
  image: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

modelSchema.index({ brand: 1 });

modelSchema.pre('save', async function () {
  if (this.isModified('name') || this.isNew) {
    try {
      let brandName = '';
      if (this.brand && this.brand.name) {
        brandName = this.brand.name;
      } else if (this.brand) {
        const Brand = mongoose.model('Brand');
        const brandDoc = await Brand.findById(this.brand);
        if (brandDoc) {
          brandName = brandDoc.name;
        }
      }

      if (brandName && !this.name.toLowerCase().startsWith(brandName.toLowerCase())) {
        this.name = `${brandName} ${this.name}`;
      }
    } catch (error) {
      console.error('Error in Model pre-save hook:', error);
      // Don't block save if naming logic fails, but log it
    }
  }
});

const Model = mongoose.model('Model', modelSchema);

export default Model;
