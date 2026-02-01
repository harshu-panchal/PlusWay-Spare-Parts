
import asyncHandler from "../../../middleware/asyncHandler.js";
import Review from "../../../models/Review.js";

// @desc    Get logged in user reviews
// @route   GET /api/customer/reviews
// @access  Private
export const getMyReviews = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Review.countDocuments({ user: req.user._id });
    const reviews = await Review.find({ user: req.user._id })
        .populate("product", "name images")
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ reviews, page, pages: Math.ceil(count / pageSize), total: count });
});
