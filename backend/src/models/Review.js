import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        name: {
            type: String,
            required: true, // Snapshot of user name
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        comment: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        adminReply: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
