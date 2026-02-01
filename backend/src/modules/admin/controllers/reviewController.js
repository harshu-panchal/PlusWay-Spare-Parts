import asyncHandler from "../../../middleware/asyncHandler.js";
import Review from "../../../models/Review.js";
import Product from "../../../models/Product.js";

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({})
        .populate("product", "name images")
        .sort({ createdAt: -1 });
    res.json(reviews);
});

// @desc    Update review status/reply
// @route   PUT /api/admin/reviews/:id
// @access  Private/Admin
export const updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (review) {
        review.status = req.body.status || review.status;
        review.adminReply = req.body.adminReply || review.adminReply;

        const updatedReview = await review.save();

        // Optional: Recalculate product rating if Approved
        // Not strictly required for this task but good practice.

        res.json(updatedReview);
    } else {
        res.status(404);
        throw new Error("Review not found");
    }
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (review) {
        await Review.deleteOne({ _id: review._id });
        res.json({ message: "Review removed" });
    } else {
        res.status(404);
        throw new Error("Review not found");
    }
});
