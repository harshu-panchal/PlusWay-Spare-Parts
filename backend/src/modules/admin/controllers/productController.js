import Product from "../../../models/Product.js";
import Brand from "../../../models/Brand.js";
import Category from "../../../models/Category.js";
import Model from "../../../models/Model.js";
import XLSX from "xlsx";
import fs from "fs";

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
export const getProducts = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.pageNumber) || 1;
  const search = req.query.search || "";
  const category = req.query.category;

  let filter = {};

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { code: { $regex: escapedSearch, $options: "i" } },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: escapedSearch,
            options: "i",
          },
        },
      },
    ];
  }

  if (category && category !== "All") {
    filter.category = category;
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("brand model category")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
// @access  Private/Admin
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "brand model category",
  );

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const {
    name,
    slug,
    code,
    description,
    price,
    wholesalePrice,
    wholesaleMinQty,
    mrp,
    cashback,
    images,
    videoUrl,
    brand,
    model,
    category,
    productType,
    countInStock,
    details,
    colors,
  } = req.body;

  const generatedSlug =
    slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

  const productExists = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
  if (productExists) {
    return res.status(400).json({ message: "Product with this name already exists" });
  }

  const productData = {
    name,
    slug: generatedSlug,
    description,
    price,
    wholesalePrice,
    wholesaleMinQty,
    mrp,
    cashback,
    images,
    videoUrl,
    brand,
    model: model || undefined, // undefined prevents casting error if empty string
    category,
    productType,
    countInStock,
    details,
    colors,
  };

  if (code) {
    productData.code = code;
  }

  const product = new Product(productData);

  try {
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Product Save Error:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    if (req.body.name) {
      product.name = req.body.name;
      if (!req.body.slug && !product.slug) {
        product.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      }
    }
    product.slug = req.body.slug || product.slug;

    // Check for duplicate name
    const productExists = await Product.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${product.name}$`, "i") }
    });

    if (productExists) {
      return res.status(400).json({ message: "Product with this name already exists" });
    }

    if (req.body.code) product.code = req.body.code;
    // If explicitly empty string, maybe unset it? unique sparse index doesn't like "".
    if (req.body.code === "") product.code = undefined;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.wholesalePrice = req.body.wholesalePrice || product.wholesalePrice;
    product.wholesaleMinQty = req.body.wholesaleMinQty || product.wholesaleMinQty;
    product.mrp = req.body.mrp || product.mrp;
    product.cashback = req.body.cashback || product.cashback;
    product.images = req.body.images || product.images;
    product.videoUrl = req.body.videoUrl || product.videoUrl;
    product.brand = req.body.brand || product.brand;
    product.model = req.body.model || product.model;
    product.category = req.body.category || product.category;
    product.productType = req.body.productType || product.productType;
    product.countInStock = req.body.countInStock !== undefined ? req.body.countInStock : product.countInStock;
    product.details = req.body.details || product.details;
    product.colors = req.body.colors || product.colors;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: "Product removed" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// @desc    Update product stock
// @route   PUT /api/admin/products/:id/stock
// @access  Private/Admin
export const updateProductStock = async (req, res) => {
  const { quantity, type } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    if (type === "add") {
      product.countInStock = Math.max(0, (product.countInStock || 0) + Number(quantity));
    } else if (type === "set") {
      product.countInStock = Math.max(0, Number(quantity));
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// @desc    Bulk create products from Excel
// @route   POST /api/admin/products/bulk-upload
// @access  Private/Admin
export const bulkCreateProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No Excel file provided" });
  }

  const results = { success: [], errors: [] };

  try {
    // Parse Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(400).json({ message: "Excel file is empty or has no data rows" });
    }

    // Pre-fetch all brands, categories, models for name → _id resolution
    const [allBrands, allCategories, allModels] = await Promise.all([
      Brand.find({}, "name _id"),
      Category.find({}, "name _id"),
      Model.find({}, "name _id"),
    ]);

    const brandMap = {};
    allBrands.forEach((b) => { brandMap[b.name.toLowerCase().trim()] = b._id; });

    const categoryMap = {};
    allCategories.forEach((c) => { categoryMap[c.name.toLowerCase().trim()] = c._id; });

    const modelMap = {};
    allModels.forEach((m) => { modelMap[m.name.toLowerCase().trim()] = m._id; });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-indexed, +1 for header)

      try {
        // Required field validation
        const requiredFields = ["name", "brand", "category", "model", "price", "mrp", "wholesalePrice", "wholesaleMinQty", "countInStock"];
        const missing = requiredFields.filter((f) => row[f] === "" || row[f] === undefined || row[f] === null);
        if (missing.length) {
          results.errors.push({ row: rowNum, name: row.name || "?", error: `Missing required fields: ${missing.join(", ")}` });
          continue;
        }

        // Resolve brand name → ObjectId
        const brandId = brandMap[String(row.brand).toLowerCase().trim()];
        if (!brandId) {
          results.errors.push({ row: rowNum, name: row.name, error: `Brand "${row.brand}" not found in database` });
          continue;
        }

        // Resolve category name → ObjectId
        const categoryId = categoryMap[String(row.category).toLowerCase().trim()];
        if (!categoryId) {
          results.errors.push({ row: rowNum, name: row.name, error: `Category "${row.category}" not found in database` });
          continue;
        }

        // Resolve model name → ObjectId
        const modelId = modelMap[String(row.model).toLowerCase().trim()];
        if (!modelId) {
          results.errors.push({ row: rowNum, name: row.name, error: `Model "${row.model}" not found in database` });
          continue;
        }

        // Check product name uniqueness
        const productName = String(row.name).trim();
        const nameExists = await Product.findOne({ name: { $regex: new RegExp(`^${productName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });
        if (nameExists) {
          results.errors.push({ row: rowNum, name: productName, error: `Product "${productName}" already exists` });
          continue;
        }

        // Parse pipe-separated image URLs
        const images = row.images
          ? String(row.images).split("|").map((u) => u.trim()).filter(Boolean)
          : [];

        // Parse comma-separated colors
        const colors = row.colors
          ? String(row.colors).split(",").map((c) => c.trim()).filter(Boolean)
          : [];

        // Parse specs: "Color:Black|RAM:8GB|Storage:256GB"
        const specs = row.specs
          ? String(row.specs).split("|").map((s) => {
              const colonIdx = s.indexOf(":");
              if (colonIdx === -1) return null;
              return { key: s.substring(0, colonIdx).trim(), value: s.substring(colonIdx + 1).trim() };
            }).filter(Boolean)
          : [];

        // Parse pipe-separated highlights
        const highlights = row.highlights
          ? String(row.highlights).split("|").map((h) => h.trim()).filter(Boolean)
          : [];

        // Parse pipe-separated description points
        const descriptionPoints = row.descriptionPoints
          ? String(row.descriptionPoints).split("|").map((p) => p.trim()).filter(Boolean)
          : [];

        // Generate unique slug
        let slug = productName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        const slugExists = await Product.findOne({ slug });
        if (slugExists) {
          slug = `${slug}-${Date.now()}`;
        }

        const productData = {
          name: productName,
          slug,
          brand: brandId,
          model: modelId,
          category: categoryId,
          productType: row.productType ? String(row.productType).trim() : undefined,
          price: Number(row.price),
          mrp: Number(row.mrp),
          wholesalePrice: Number(row.wholesalePrice),
          wholesaleMinQty: Number(row.wholesaleMinQty) || 10,
          cashback: Number(row.cashback) || 0,
          countInStock: Number(row.countInStock) || 0,
          description: row.description ? String(row.description).trim() : "",
          images,
          videoUrl: row.videoUrl ? String(row.videoUrl).trim() : undefined,
          colors,
          details: {
            specs,
            inTheBox: row.inTheBox ? String(row.inTheBox).trim() : "",
            warranty: {
              period: row.warrantyPeriod ? String(row.warrantyPeriod).trim() : "",
              policy: row.warrantyPolicy ? String(row.warrantyPolicy).trim() : "",
              summary: row.warrantySummary ? String(row.warrantySummary).trim() : "",
            },
            highlights,
            descriptionPoints,
          },
        };

        // Only set code if non-empty (sparse unique index dislikes empty strings)
        if (row.code && String(row.code).trim()) {
          productData.code = String(row.code).trim();
        }

        const product = new Product(productData);
        await product.save();
        results.success.push({ row: rowNum, name: productName });

      } catch (rowError) {
        results.errors.push({ row: rowNum, name: row.name || "?", error: rowError.message });
      }
    }

    // Clean up uploaded Excel file
    try { fs.unlinkSync(req.file.path); } catch (_) {}

    const statusCode = results.success.length > 0 ? 200 : 400;
    return res.status(statusCode).json({
      message: `Bulk upload complete. ${results.success.length} created, ${results.errors.length} failed.`,
      total: rows.length,
      successCount: results.success.length,
      errorCount: results.errors.length,
      results,
    });

  } catch (error) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    console.error("Bulk product upload error:", error);
    return res.status(500).json({ message: "Bulk upload failed", error: error.message });
  }
};
