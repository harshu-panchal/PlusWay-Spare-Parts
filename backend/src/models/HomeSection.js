import mongoose from 'mongoose';

const homeSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    displayType: {
        type: String,
        enum: ['brands', 'categories', 'models', 'products'],
        default: 'categories',
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    productsPerRow: {
        type: Number,
        default: 4,
    },
    filterDeviceType: {
        type: String,
        enum: ['Mobile', 'Tablet', 'Smartwatch', 'Accessories', 'Other', ''],
        default: '',
    },
}, {
    timestamps: true,
});

const HomeSection = mongoose.model('HomeSection', homeSectionSchema);

export default HomeSection;
