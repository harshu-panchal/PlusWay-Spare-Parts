import asyncHandler from "../../../middleware/asyncHandler.js";
import Review from "../../../models/Review.js";
import Product from "../../../models/Product.js";

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getReviews = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 20;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Review.countDocuments({});
    const reviews = await Review.find({})
        .populate("product", "name images")
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ reviews, page, pages: Math.ceil(count / pageSize), total: count });
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

        // Sync with Product's embedded review
        const product = await Product.findById(review.product);
        if (product) {
            let pReview = product.reviews.id(review._id);

            // 1. Try matching by User ID (Primary)
            if (!pReview) {
                pReview = product.reviews.find(r => r.user.toString() === review.user.toString());
            }

            // 2. Try matching by Content/Name (Fallback)
            if (!pReview) {
                pReview = product.reviews.find(r =>
                    r.comment === review.comment &&
                    r.name === review.name
                );
            }

            if (pReview) {
                pReview.status = review.status;
                pReview.adminReply = review.adminReply;
                await product.save();
            } else {
                console.log(`[ReviewSync] Failed to find embedded review for ${review._id} in Product ${product._id}`);
            }
        }

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
