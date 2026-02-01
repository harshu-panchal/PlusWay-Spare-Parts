import Product from "../../../models/Product.js";
import asyncHandler from "../../../middleware/asyncHandler.js";

// @desc    Get all products
// @route   GET /api/customer/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 100;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: "i",
            },
        }
        : {};

    // Filters
    const filters = { ...keyword };
    if (req.query.category) filters.category = req.query.category;
    if (req.query.brand) filters.brand = req.query.brand;
    if (req.query.model) filters.model = req.query.model;

    // Handling type/productType
    if (req.query.type) {
        // Check if type is numeric (ID) or string (productType)
        // Since our new schema uses string productType or nested type, we need to adapt based on how frontend sends it.
        // For now, let's assume filtering by the 'productType' field if sent as text, 
        // or ignore if it's the old numeric ID until that's fully mapped.
        // OR if the user sends 'productType=LCD...'
    }
    if (req.query.productType) filters.productType = req.query.productType;


    const count = await Product.countDocuments(filters);
    const products = await Product.find(filters)
        .populate("brand", "name")
        .populate("category", "name")
        .populate("model", "name")
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get product by ID
// @route   GET /api/customer/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate("brand", "name")
        .populate("category", "name")
        .populate("model", "name");

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error("Product not found");
    }
});

// @desc    Create new review
// @route   POST /api/customer/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error("Product already reviewed");
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: "Review added" });
    } else {
        res.status(404);
        throw new Error("Product not found");
    }
});
