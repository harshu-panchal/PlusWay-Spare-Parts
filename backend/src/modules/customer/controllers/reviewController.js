
import asyncHandler from "../../../middleware/asyncHandler.js";
import Review from "../../../models/Review.js";

// @desc    Get logged in user reviews
// @route   GET /api/customer/reviews
// @access  Private
export const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.user._id })
        .populate("product", "name images")
        .sort({ createdAt: -1 });
    res.json(reviews);
});
