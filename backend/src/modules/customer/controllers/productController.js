import Product from "../../../models/Product.js";
import Category from "../../../models/Category.js";
import Brand from "../../../models/Brand.js";
import Model from "../../../models/Model.js";
import Review from "../../../models/Review.js";
import asyncHandler from "../../../middleware/asyncHandler.js";
import {
  escapeRegex,
  tokenizeSearchQuery,
} from "../../../utils/wildSearch.js";

// @desc    Get all products
// @route   GET /api/customer/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    // Page size is client-controlled but capped at 100 so a malicious caller
    // can't trigger an unbounded read. Default 20 preserves the legacy
    // behaviour for any callers that don't supply pageSize.
    const pageSize = Math.min(
        Math.max(Number(req.query.pageSize) || 20, 1),
        100,
    );
    const page = Number(req.query.pageNumber) || 1;
    const sort = req.query.sort || "relevance";

    const keywordRaw = String(req.query.keyword || "").trim();
    const keywordTokens = tokenizeSearchQuery(keywordRaw);

    // Hide Draft products from the storefront. Products created before the
    // `status` field existed have no value set — treat that the same as
    // Published so legacy catalog data doesn't silently disappear.
    const filters = { status: { $ne: "Draft" } };

    if (keywordTokens.length > 0) {
        const tokenClauses = await Promise.all(
            keywordTokens.map(async (token) => {
                const regex = { $regex: escapeRegex(token), $options: "i" };
                const [brandIds, modelIds] = await Promise.all([
                    Brand.find({ name: regex }).distinct("_id"),
                    Model.find({ name: regex }).distinct("_id"),
                ]);

                const orClause = [
                    { name: regex },
                    { code: regex },
                    { "colorVariants.sku": regex },
                    { "colorVariants.colorName": regex },
                ];
                if (brandIds.length) orClause.push({ brand: { $in: brandIds } });
                if (modelIds.length) orClause.push({ model: { $in: modelIds } });

                return { $or: orClause };
            }),
        );
        filters.$and = tokenClauses;
    }
    
    if (req.query.category) {
        // Special logic for "Mobile spare parts" and "Accessories"
        const requestedCategory = await Category.findById(req.query.category);
        const catName = requestedCategory ? requestedCategory.name.trim().toLowerCase() : "";
        if (catName === "mobile spare parts" || catName === "mobile spare part") {
            const extraCategories = await Category.find({ showInMobileSpareParts: true });
            const categoryIds = [req.query.category, ...extraCategories.map(c => c._id)];
            filters.category = { $in: categoryIds };
        } else if (catName === "accessories" || catName === "accessory") {
            const extraCategories = await Category.find({ showInAccessories: true });
            const categoryIds = [req.query.category, ...extraCategories.map(c => c._id)];
            filters.category = { $in: categoryIds };
        } else {
            filters.category = req.query.category;
        }
    }
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
    if (req.query.deviceType && req.query.deviceType.toLowerCase() !== "all") {
        filters.deviceType = { $in: [new RegExp(`^${escapeRegex(req.query.deviceType.trim())}$`, 'i')] };
    }

    if (req.query.minPrice || req.query.maxPrice) {
        filters.price = {};
        if (req.query.minPrice && !isNaN(Number(req.query.minPrice))) {
            filters.price.$gte = Number(req.query.minPrice);
        }
        if (req.query.maxPrice && !isNaN(Number(req.query.maxPrice))) {
            filters.price.$lte = Number(req.query.maxPrice);
        }
    }

    if (req.query.inStock === 'true' || req.query.inStock === true) {
        filters.stock = { $gt: 0 };
    }



    let sortQuery = { createdAt: -1 };
    switch (sort) {
        case "priceAsc":
            sortQuery = { price: 1 };
            break;
        case "priceDesc":
            sortQuery = { price: -1 };
            break;
        case "rating":
            sortQuery = { rating: -1, numReviews: -1 };
            break;
        case "nameAsc":
            sortQuery = { name: 1 };
            break;
        case "newest":
            sortQuery = { createdAt: -1 };
            break;
        default:
            // Relevance fallback: newest first when explicit scoring isn't available
            sortQuery = { createdAt: -1 };
    }

    // Optimize with Promise.all
    const [count, products] = await Promise.all([
        Product.countDocuments(filters),
        Product.find(filters)
            .populate("brand", "name")
            .populate("category", "name order")
            .populate("model", "name")
            .sort(sortQuery)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
    ]);

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get product by ID
// @route   GET /api/customer/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate("brand", "name")
        .populate("category", "name order")
        .populate("model", "name image");

    if (product && product.status !== "Draft") {
        const productObj = product.toObject();
        // Only send approved reviews to the customer frontend
        productObj.reviews = productObj.reviews.filter(r => r.status === "Approved");
        res.json(productObj);
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
            status: "Pending", // Add status explicitly to the embedded document
        };

        // 1. Add to Product's review array (for seamless embedded display)
        product.reviews.push(review);
        // We do NOT update numReviews and rating here anymore,
        // because those should only reflect "Approved" reviews.
        // It will be calculated in the admin review controller upon approval.
        await product.save();

        // 2. Create independent Review document (for Admin/My Reviews)
        await Review.create({
            product: product._id,
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
            status: "Pending" // Default status
        });

        res.status(201).json({ message: "Review added" });
    } else {
        res.status(404);
        throw new Error("Product not found");
    }
});
