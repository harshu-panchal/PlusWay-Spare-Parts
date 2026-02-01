import mongoose from 'mongoose';

const homeSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
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
}, {
    timestamps: true,
});

const HomeSection = mongoose.model('HomeSection', homeSectionSchema);

export default HomeSection;
