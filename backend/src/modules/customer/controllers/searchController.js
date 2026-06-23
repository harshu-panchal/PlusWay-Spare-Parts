import asyncHandler from "../../../middleware/asyncHandler.js";
import Product from "../../../models/Product.js";
import Model from "../../../models/Model.js";
import {
  buildWildSearchMatch,
  tokenizeSearchQuery,
} from "../../../utils/wildSearch.js";

const PRODUCT_SEARCH_FIELDS = [
  "name",
  "code",
  "brandName",
  "modelName",
  "colorVariants.sku",
  "colorVariants.colorName",
];

const MODEL_SEARCH_FIELDS = ["name", "brandName"];

const mapProductHit = (doc) => ({
  _id: doc._id,
  name: doc.name,
  code: doc.code || "",
  price: doc.price ?? 0,
  image: Array.isArray(doc.images) && doc.images.length ? doc.images[0] : "",
  brand: doc.brandDoc
    ? { _id: doc.brandDoc._id, name: doc.brandDoc.name }
    : null,
  model: doc.modelDoc
    ? { _id: doc.modelDoc._id, name: doc.modelDoc.name }
    : null,
});

const mapModelHit = (doc) => ({
  _id: doc._id,
  name: doc.name,
  image: doc.image || doc.brandDoc?.logo || "",
  released: doc.released || "",
  displaySize: doc.displaySize || "",
  brand: doc.brandDoc
    ? { _id: doc.brandDoc._id, name: doc.brandDoc.name, logo: doc.brandDoc.logo }
    : null,
});

const searchProducts = async (query, limit) => {
  const match = buildWildSearchMatch(query, PRODUCT_SEARCH_FIELDS);
  if (!match) return [];

  const rows = await Product.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brandDoc",
      },
    },
    {
      $lookup: {
        from: "models",
        localField: "model",
        foreignField: "_id",
        as: "modelDoc",
      },
    },
    {
      $addFields: {
        brandDoc: { $arrayElemAt: ["$brandDoc", 0] },
        modelDoc: { $arrayElemAt: ["$modelDoc", 0] },
        brandName: { $arrayElemAt: ["$brandDoc.name", 0] },
        modelName: { $arrayElemAt: ["$modelDoc.name", 0] },
      },
    },
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
  ]);

  return rows.map(mapProductHit);
};

const searchModels = async (query, limit) => {
  const match = buildWildSearchMatch(query, MODEL_SEARCH_FIELDS);
  if (!match) return [];

  const rows = await Model.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brandDoc",
      },
    },
    {
      $addFields: {
        brandDoc: { $arrayElemAt: ["$brandDoc", 0] },
        brandName: { $arrayElemAt: ["$brandDoc.name", 0] },
      },
    },
    { $match: match },
    { $sort: { name: 1 } },
    { $limit: limit },
  ]);

  return rows.map(mapModelHit);
};

// @desc    Wild search across products and models (header autocomplete)
// @route   GET /api/customer/search
// @access  Public
// Query: q (required, min 2 chars), limit (optional, default 5, max 10)
export const globalSearch = asyncHandler(async (req, res) => {
  const query = String(req.query.q || req.query.search || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 10);

  if (query.length < 2) {
    return res.json({ models: [], products: [], query });
  }

  if (!tokenizeSearchQuery(query).length) {
    return res.json({ models: [], products: [], query });
  }

  const [models, products] = await Promise.all([
    searchModels(query, limit),
    searchProducts(query, limit),
  ]);

  res.json({ models, products, query });
});
