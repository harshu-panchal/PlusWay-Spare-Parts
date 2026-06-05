import Product from "../../../models/Product.js";
import Brand from "../../../models/Brand.js";
import Category from "../../../models/Category.js";
import Model from "../../../models/Model.js";
import XLSX from "xlsx";
import fs from "fs";
import ExcelJS from "exceljs";
import BulkUploadHistory from "../../../models/BulkUploadHistory.js";
import path from "path";

// Helper: generate a unique variant SKU
const genVariantSku = (colorName) => {
  const colorCode = colorName
    .replace(/\s+/g, "")
    .toUpperCase()
    .slice(0, 3);
  return `PW-${colorCode}-${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 90)}`;
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
export const getProducts = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.pageNumber) || 1;
  const search = req.query.search || "";
  const category = req.query.category;
  const brand = req.query.brand;

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

  if (brand && brand !== "All") {
    filter.brand = brand;
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
    colorVariants,
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
    // When colorVariants are provided, derive product-level price from first variant for listing display
    price: price !== undefined ? price : (colorVariants?.length ? (colorVariants[0]?.price ?? 0) : 0),
    wholesalePrice: wholesalePrice !== undefined ? wholesalePrice : (colorVariants?.length ? (colorVariants[0]?.wholesalePrice ?? 0) : 0),
    wholesaleMinQty: wholesaleMinQty !== undefined ? wholesaleMinQty : (colorVariants?.length ? (colorVariants[0]?.wholesaleMinQty ?? 10) : 10),
    mrp: mrp !== undefined ? mrp : (colorVariants?.length ? (colorVariants[0]?.mrp ?? 0) : 0),
    cashback,
    images,
    videoUrl,
    brand,
    model: model || undefined,
    category,
    productType,
    // Product-level stock = sum of variant stocks when variants are provided
    countInStock: countInStock !== undefined ? countInStock
      : (colorVariants?.length ? colorVariants.reduce((sum, v) => sum + (Number(v.countInStock) || 0), 0) : 0),
    details,
    colors,
    colorVariants,
  };

  if (code) {
    productData.code = code;
  } else {
    // Auto-generate product-level SKU
    productData.code = `PW-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
  }

  // Auto-generate SKU for any color variant that doesn't have one
  if (Array.isArray(productData.colorVariants)) {
    productData.colorVariants = productData.colorVariants.map(v => ({
      ...v,
      sku: v.sku && v.sku.trim() ? v.sku.trim() : genVariantSku(v.colorName),
    }));
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

    const incomingVariants = req.body.colorVariants;
    const hasVariants = Array.isArray(incomingVariants) && incomingVariants.filter(v => v.colorName?.trim()).length > 0;

    if (hasVariants) {
      // Derive product-level fields from variants for listing/search display
      const activeVariants = incomingVariants.filter(v => v.colorName?.trim());
      const firstVariant = activeVariants[0];
      product.price = firstVariant?.price ?? product.price;
      product.mrp = firstVariant?.mrp ?? product.mrp;
      product.wholesalePrice = firstVariant?.wholesalePrice ?? product.wholesalePrice;
      product.wholesaleMinQty = firstVariant?.wholesaleMinQty ?? product.wholesaleMinQty;
      product.countInStock = activeVariants.reduce((sum, v) => sum + (Number(v.countInStock) || 0), 0);
    } else {
      product.price = req.body.price !== undefined ? req.body.price : product.price;
      product.wholesalePrice = req.body.wholesalePrice !== undefined ? req.body.wholesalePrice : product.wholesalePrice;
      product.wholesaleMinQty = req.body.wholesaleMinQty !== undefined ? req.body.wholesaleMinQty : product.wholesaleMinQty;
      product.mrp = req.body.mrp !== undefined ? req.body.mrp : product.mrp;
      product.countInStock = req.body.countInStock !== undefined ? req.body.countInStock : product.countInStock;
    }

    product.cashback = req.body.cashback || product.cashback;
    product.images = req.body.images || product.images;
    product.videoUrl = req.body.videoUrl || product.videoUrl;
    product.brand = req.body.brand || product.brand;
    product.model = req.body.model || product.model;
    product.category = req.body.category || product.category;
    product.productType = req.body.productType || product.productType;
    product.details = req.body.details
      ? {
          ...((product.details || {}).toObject ? product.details.toObject() : product.details || {}),
          ...req.body.details,
          warranty: {
            ...((product.details?.warranty || {})),
            ...(req.body.details?.warranty || {}),
          },
        }
      : product.details;
    product.markModified("details");
    product.colors = req.body.colors || product.colors;
    product.colorVariants = req.body.colorVariants !== undefined
      ? req.body.colorVariants.map(v => ({
          ...v,
          sku: v.sku && v.sku.trim() ? v.sku.trim() : genVariantSku(v.colorName),
        }))
      : product.colorVariants;

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

// @desc    Bulk delete products
// @route   DELETE /api/admin/products/bulk
// @access  Private/Admin
export const deleteBulkProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided" });
    }
    
    const result = await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} products removed` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product stock
// @route   PUT /api/admin/products/:id/stock
// @access  Private/Admin
export const updateProductStock = async (req, res) => {
  const { quantity, type, variantColorName } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    if (variantColorName) {
      // Update a specific color variant's stock
      const variantIdx = product.colorVariants.findIndex(v => v.colorName === variantColorName);
      if (variantIdx === -1) {
        return res.status(404).json({ message: `Variant "${variantColorName}" not found` });
      }
      const currentStock = product.colorVariants[variantIdx].countInStock || 0;
      if (type === "add") {
        product.colorVariants[variantIdx].countInStock = Math.max(0, currentStock + Number(quantity));
      } else if (type === "set") {
        product.colorVariants[variantIdx].countInStock = Math.max(0, Number(quantity));
      }
      product.markModified("colorVariants");
    } else {
      // Update product-level stock
      if (type === "add") {
        product.countInStock = Math.max(0, (product.countInStock || 0) + Number(quantity));
      } else if (type === "set") {
        product.countInStock = Math.max(0, Number(quantity));
      }
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
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    
    // Normalize keys (remove " *" from required field headers)
    const rows = rawRows.map(row => {
      const cleanRow = {};
      for (const key in row) {
        const cleanKey = key.replace(/\s*\*\s*$/, '').trim();
        cleanRow[cleanKey] = row[key];
      }
      return cleanRow;
    });

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
        // Required field validation — pricing/stock only required when no colorVariants provided
        const hasVariantData = row.colorVariants && String(row.colorVariants).trim().length > 0;
        const alwaysRequired = ["name", "brand", "category", "model"];
        const pricingRequired = hasVariantData ? [] : ["price", "mrp", "wholesalePrice", "wholesaleMinQty", "countInStock"];
        const requiredFields = [...alwaysRequired, ...pricingRequired];
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

        // Parse colorVariants (rich format):
        // colorVariants column: each variant separated by ||
        // Each variant format: colorName;sku;price;mrp;wholesalePrice;wholesaleMinQty;countInStock;img1,img2
        // Legacy simple format still supported: Black:url1,url2|White:url3
        const colorVariants = (() => {
          if (!row.colorVariants) return [];
          const raw = String(row.colorVariants).trim();
          // Detect rich format (contains semicolons in first segment)
          if (raw.includes("||") || (raw.includes(";") && !raw.includes(":"))) {
            // Rich format: variantA||variantB where each = name;sku;price;mrp;wsPrice;wsMinQty;stock;img1,img2
            return raw.split("||").map(variantStr => {
              const parts = variantStr.split(";").map(p => p.trim());
              return {
                colorName: parts[0] || "",
                sku: (parts[1] && parts[1].trim()) ? parts[1].trim() : genVariantSku(parts[0] || "VAR"),
                price: parts[2] ? Number(parts[2]) : undefined,
                mrp: parts[3] ? Number(parts[3]) : undefined,
                wholesalePrice: parts[4] ? Number(parts[4]) : undefined,
                wholesaleMinQty: parts[5] ? Number(parts[5]) : undefined,
                countInStock: parts[6] ? Number(parts[6]) : 0,
                images: parts[7] ? parts[7].split(",").map(u => u.trim()).filter(Boolean) : [],
              };
            }).filter(v => v.colorName);
          }
          // Legacy format: Black:url1,url2|White:url3
          return raw.split("|").map(variantStr => {
            const colonIdx = variantStr.indexOf(":");
            if (colonIdx === -1) return { colorName: variantStr.trim(), images: [] };
            const colorName = variantStr.substring(0, colonIdx).trim();
            const images = variantStr.substring(colonIdx + 1).split(",").map(i => i.trim()).filter(Boolean);
            return { colorName, sku: genVariantSku(colorName), images };
          }).filter(Boolean);
        })();

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

        const firstVariant = colorVariants.length ? colorVariants[0] : null;

        const productData = {
          name: productName,
          slug,
          brand: brandId,
          model: modelId,
          category: categoryId,
          productType: row.productType ? String(row.productType).trim() : undefined,
          // When variants exist, derive product-level pricing from first variant for listing display
          price: firstVariant?.price ?? (row.price ? Number(row.price) : 0),
          mrp: firstVariant?.mrp ?? (row.mrp ? Number(row.mrp) : 0),
          wholesalePrice: firstVariant?.wholesalePrice ?? (row.wholesalePrice ? Number(row.wholesalePrice) : 0),
          wholesaleMinQty: firstVariant?.wholesaleMinQty ?? (row.wholesaleMinQty ? Number(row.wholesaleMinQty) : 10),
          cashback: Number(row.cashback) || 0,
          // Product-level stock = sum of variant stocks when variants are used
          countInStock: colorVariants.length
            ? colorVariants.reduce((sum, v) => sum + (Number(v.countInStock) || 0), 0)
            : (Number(row.countInStock) || 0),
          description: row.description ? String(row.description).split("\n").map(p => p.trim()).filter(Boolean) : [],
          images,
          videoUrl: row.videoUrl ? String(row.videoUrl).trim() : undefined,
          colors,
          colorVariants,
          details: {
            specs,
            inTheBox: row.inTheBox ? String(row.inTheBox).trim() : "",
            warranty: {
              period: row.warrantyPeriod ? String(row.warrantyPeriod).trim() : "",
              policy: row.warrantyPolicy ? String(row.warrantyPolicy).trim() : "",
              summary: row.warrantySummary ? String(row.warrantySummary).trim() : "",
              coveredInWarranty: row.coveredInWarranty ? String(row.coveredInWarranty).trim() : "",
              serviceType: row.warrantyServiceType ? String(row.warrantyServiceType).trim() : "",
              tnc: row.warrantyTnC ? String(row.warrantyTnC).trim() : "",
            },
            highlights,
            descriptionPoints,
            countryOfOrigin: row.countryOfOrigin ? String(row.countryOfOrigin).trim() : "",
            packer: row.packer ? String(row.packer).trim() : "",
          },
        };

        // Only set code if non-empty (sparse unique index dislikes empty strings)
        const skuValue = row.SKU || row.code;
        if (skuValue && String(skuValue).trim()) {
          productData.code = String(skuValue).trim();
        } else {
          productData.code = `PW-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
        }

        const product = new Product(productData);
        await product.save();
        results.success.push({ row: rowNum, name: productName });

      } catch (rowError) {
        results.errors.push({ row: rowNum, name: row.name || "?", error: rowError.message });
      }
    }

    // Clean up uploaded Excel file only if it was completely empty
    // Otherwise we rename and save it for history

    let savedFileName = req.file.filename;
    let savedFilePath = req.file.path;

    if (rows.length > 0) {
      // Append original extension so it can be downloaded properly
      const ext = path.extname(req.file.originalname) || '.xlsx';
      savedFileName = `${req.file.filename}${ext}`;
      savedFilePath = `${req.file.path}${ext}`;
      fs.renameSync(req.file.path, savedFilePath);

      // Record in history
      await BulkUploadHistory.create({
        fileName: req.file.originalname,
        filePath: savedFileName, // just store the filename in uploads dir
        uploadType: "Products",
        totalRows: rows.length,
        successCount: results.success.length,
        errorCount: results.errors.length,
        uploadedBy: req.user._id, // Assumes admin user is in req.user
      });
    } else {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

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

// @desc    Download Excel template for bulk product upload with dropdowns
// @route   GET /api/admin/products/bulk-template
// @access  Private/Admin
export const downloadProductTemplate = async (req, res) => {
  try {
    const [brands, categories, models] = await Promise.all([
      Brand.find({}, "name").sort({ name: 1 }),
      Category.find({}, "name").sort({ name: 1 }),
      Model.find({}, "name").sort({ name: 1 }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PlusWay Admin";
    workbook.lastModifiedBy = "PlusWay Admin";
    workbook.created = new Date();
    workbook.modified = new Date();

    // 1. Create Products Sheet FIRST so it is parsed as the default sheet
    const ws = workbook.addWorksheet("Products");

    // 2. Create Data List Sheet (hidden)
    const listsSheet = workbook.addWorksheet("_Lists");
    listsSheet.state = "veryHidden";

    // Set headers for _Lists
    listsSheet.getCell("A1").value = "Brands";
    listsSheet.getCell("B1").value = "Categories";
    listsSheet.getCell("C1").value = "Models";

    // Populate Brands
    brands.forEach((brand, idx) => {
      listsSheet.getCell(`A${idx + 2}`).value = brand.name;
    });

    // Populate Categories
    categories.forEach((cat, idx) => {
      listsSheet.getCell(`B${idx + 2}`).value = cat.name;
    });

    // Populate Models
    models.forEach((model, idx) => {
      listsSheet.getCell(`C${idx + 2}`).value = model.name;
    });

    // Define columns
    // NOTE: For products WITHOUT color variants, fill SKU / price / mrp / wholesalePrice /
    // wholesaleMinQty / countInStock and leave colorVariants blank.
    // For products WITH color variants, fill colorVariants (which carries its own SKU /
    // price / stock per variant) and leave SKU / price / stock columns blank.
    const columns = [
      { header: "name *", key: "name", example: "LCD Screen Samsung S23 Ultra", example2: "Battery iPhone 14 Pro" },
      { header: "brand *", key: "brand", example: "Samsung", example2: "Apple" },
      { header: "model *", key: "model", example: "Samsung Galaxy S23 Ultra", example2: "Apple iPhone 14 Pro" },
      { header: "category *", key: "category", example: "LCD Display", example2: "Battery" },
      { header: "SKU", key: "SKU", example: "", example2: "PW-BAT-IP14P-001" },
      { header: "price", key: "price", example: "", example2: 2500 },
      { header: "mrp", key: "mrp", example: "", example2: 3000 },
      { header: "wholesalePrice", key: "wholesalePrice", example: "", example2: 2100 },
      { header: "wholesaleMinQty", key: "wholesaleMinQty", example: "", example2: 10 },
      { header: "countInStock", key: "countInStock", example: "", example2: 50 },
      { header: "colorVariants", key: "colorVariants", example: "Black;PW-BLA-001;4500;5500;3800;10;50;http://img1.jpg,http://img2.jpg||White;PW-WHI-002;4700;5500;3900;10;20;http://img3.jpg", example2: "" },
      { header: "description", key: "description", example: "Paragraph 1\nParagraph 2", example2: "Long lasting battery" },
      { header: "images", key: "images", example: "http://server/uploads/img1.jpg|http://server/uploads/img2.jpg", example2: "" },
      { header: "videoUrl", key: "videoUrl", example: "", example2: "" },
      { header: "specs", key: "specs", example: "Color:Black|Compatibility:S23 Ultra|Type:AMOLED", example2: "Capacity:3000mAh|Voltage:3.8V" },
      { header: "inTheBox", key: "inTheBox", example: "LCD Display, Installation Guide", example2: "Battery" },
      { header: "warrantySummary", key: "warrantySummary", example: "10 Days Testing Replacement Warranty", example2: "" },
      { header: "coveredInWarranty", key: "coveredInWarranty", example: "Yes, Replacement Only. No Returns", example2: "" },
      { header: "warrantyServiceType", key: "warrantyServiceType", example: "Send to seller by courier", example2: "" },
      { header: "warrantyTnC", key: "warrantyTnC", example: "Warranty Terms", example2: "" },
      { header: "countryOfOrigin", key: "countryOfOrigin", example: "China", example2: "India" },
      { header: "packer", key: "packer", example: "Elcotek India Pvt Ltd, New Delhi", example2: "" },
      { header: "highlights", key: "highlights", example: "Super AMOLED|Fast Charging|5G Ready", example2: "Long Life|Safe Chemistry" },
      { header: "descriptionPoints", key: "descriptionPoints", example: "100% Original Part|Quality Tested", example2: "Safe and reliable" },
    ];

    ws.columns = columns.map(c => ({
      header: c.header,
      key: c.key,
      width: 28,
    }));

    // Header styling
    const headerRow = ws.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" }, // Premium Indigo
      };
      cell.font = {
        name: "Segoe UI",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Add Example rows
    const row2 = ws.addRow(columns.map(c => c.example));
    row2.height = 20;
    row2.eachCell((cell) => {
      cell.font = {
        name: "Segoe UI",
        size: 10,
        italic: true,
        color: { argb: "FF64748B" }, // Cool gray
      };
      cell.alignment = {
        vertical: "middle",
      };
    });

    const row3 = ws.addRow(columns.map(c => c.example2));
    row3.height = 20;
    row3.eachCell((cell) => {
      cell.font = {
        name: "Segoe UI",
        size: 10,
        italic: true,
        color: { argb: "FF64748B" }, // Cool gray
      };
      cell.alignment = {
        vertical: "middle",
      };
    });

    // Data validations for brand (col C), model (col D), category (col E)
    const brandEnd = Math.max(2, brands.length + 1);
    const categoryEnd = Math.max(2, categories.length + 1);
    const modelEnd = Math.max(2, models.length + 1);

    for (let i = 2; i <= 1000; i++) {
      // Column B: Brand
      ws.getCell(`B${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`_Lists!$A$2:$A$${brandEnd}`],
        showErrorMessage: true,
        errorTitle: "Invalid Brand",
        error: "Please select a Brand from the dropdown list."
      };
      // Column C: Model
      ws.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`_Lists!$C$2:$C$${modelEnd}`],
        showErrorMessage: true,
        errorTitle: "Invalid Model",
        error: "Please select a Model from the dropdown list."
      };
      // Column D: Category
      ws.getCell(`D${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`_Lists!$B$2:$B$${categoryEnd}`],
        showErrorMessage: true,
        errorTitle: "Invalid Category",
        error: "Please select a Category from the dropdown list."
      };
    }

    // Instructions sheet – explains how to use the template
    const instr = workbook.addWorksheet("Instructions");
    instr.columns = [{ width: 38 }, { width: 70 }];
    const instructionRows = [
      ["INSTRUCTIONS FOR BULK PRODUCT UPLOAD", ""],
      ["", ""],
      ["1. Row 1 contains column headers", "Do NOT rename or reorder them."],
      ["2. Rows 2 & 3 are EXAMPLES", "Row 2 = product WITH color variants. Row 3 = product WITHOUT color variants. Delete or overwrite both before uploading."],
      ["", ""],
      ["PRODUCTS WITHOUT COLOR VARIANTS", "Fill: SKU, price, mrp, wholesalePrice, wholesaleMinQty, countInStock. Leave colorVariants BLANK."],
      ["PRODUCTS WITH COLOR VARIANTS", "Fill colorVariants column (carries SKU + price + stock per variant). Leave the top-level SKU / price / mrp / wholesalePrice / wholesaleMinQty / countInStock columns BLANK."],
      ["", ""],
      ["colorVariants format", "Per variant: colorName;sku;price;mrp;wholesalePrice;wholesaleMinQty;countInStock;img1,img2"],
      ["", "Separate multiple variants with ||"],
      ["", "Example: Black;PW-BLA-001;4500;5500;3800;10;50;http://img1.jpg||White;PW-WHI-002;4700;5500;3900;10;20;http://img2.jpg"],
      ["", "Leave sku blank inside a variant to auto-generate."],
      ["", ""],
      ["brand / model / category", "Must match existing names in the admin (case-insensitive). Use the dropdowns provided."],
      ["images", "Pipe-separated full URLs -> url1|url2|url3"],
      ["specs", "key:value pairs, pipe-separated -> Color:Black|RAM:8GB"],
      ["highlights / descriptionPoints", "Pipe-separated -> Fast Charging|5G Ready"],
      ["SKU (top-level)", "Leave blank to auto-generate (e.g. PW-123456)."],
      ["Max file size", "10 MB"],
    ];
    instructionRows.forEach((r) => instr.addRow(r));
    instr.getRow(1).font = { bold: true, size: 13, color: { argb: "FF4F46E5" } };
    [3, 4, 6, 7, 9, 14, 15, 16, 17, 18, 19].forEach((rowNum) => {
      const cell = instr.getRow(rowNum).getCell(1);
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=plusway_products_bulk_template.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating product template:", error);
    res.status(500).json({ message: "Failed to generate Excel template", error: error.message });
  }
};

// Shared column schema used by BOTH `downloadBulkUpdateTemplate` AND
// `exportProductsBackup`. Keeping it in one place guarantees the two files
// have IDENTICAL layouts, so an export can be round-tripped through the
// bulk-update endpoint without manual reformatting.
//
// IMPORTANT: SKU MUST stay at index 0 — bulkUpdateProductsBySku uses it as
// the lookup key. Column order is also the order the admin sees in Excel,
// so variant-applicable columns are grouped at the front.
const BULK_PRODUCT_COLUMNS = [
  { header: "SKU *", key: "SKU", width: 24 },
  { header: "colorName", key: "colorName", width: 18 },
  { header: "price", key: "price", width: 12 },
  { header: "mrp", key: "mrp", width: 12 },
  { header: "wholesalePrice", key: "wholesalePrice", width: 16 },
  { header: "wholesaleMinQty", key: "wholesaleMinQty", width: 16 },
  { header: "countInStock", key: "countInStock", width: 14 },
  { header: "images", key: "images", width: 60 },
  { header: "name", key: "name", width: 36 },
  { header: "description", key: "description", width: 50 },
  { header: "cashback", key: "cashback", width: 12 },
  { header: "brand", key: "brand", width: 18 },
  { header: "model", key: "model", width: 26 },
  { header: "category", key: "category", width: 18 },
  { header: "productType", key: "productType", width: 22 },
  { header: "videoUrl", key: "videoUrl", width: 40 },
  { header: "specs", key: "specs", width: 50 },
  { header: "inTheBox", key: "inTheBox", width: 30 },
  { header: "warrantyPeriod", key: "warrantyPeriod", width: 18 },
  { header: "warrantyPolicy", key: "warrantyPolicy", width: 22 },
  { header: "warrantySummary", key: "warrantySummary", width: 30 },
  { header: "coveredInWarranty", key: "coveredInWarranty", width: 28 },
  { header: "warrantyServiceType", key: "warrantyServiceType", width: 26 },
  { header: "warrantyTnC", key: "warrantyTnC", width: 22 },
  { header: "highlights", key: "highlights", width: 40 },
  { header: "descriptionPoints", key: "descriptionPoints", width: 40 },
  { header: "countryOfOrigin", key: "countryOfOrigin", width: 18 },
  { header: "packer", key: "packer", width: 30 },
  { header: "colors", key: "colors", width: 22 },
];

const _colLetter = (n) => {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

// Step 1 of any bulk-product workbook: define columns from the supplied
// schema, style the header row, build the hidden `_Lists` sheet that powers
// the brand / category / model dropdowns. Call this BEFORE adding any data
// rows. `columns` is an array of { header, key, width }.
const setupExcelSheetHeader = ({ workbook, ws, columns, brands, categories, models }) => {
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  // Header styling (indigo background, white bold text).
  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
    cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  ws.views = [{ state: "frozen", ySplit: 1 }];

  // Hidden lists sheet powering the dropdowns.
  let listsSheet = workbook.getWorksheet("_Lists");
  if (!listsSheet) {
    listsSheet = workbook.addWorksheet("_Lists");
    listsSheet.state = "veryHidden";
    listsSheet.getCell("A1").value = "Brands";
    listsSheet.getCell("B1").value = "Categories";
    listsSheet.getCell("C1").value = "Models";
    brands.forEach((b, i) => { listsSheet.getCell(`A${i + 2}`).value = b.name; });
    categories.forEach((c, i) => { listsSheet.getCell(`B${i + 2}`).value = c.name; });
    models.forEach((m, i) => { listsSheet.getCell(`C${i + 2}`).value = m.name; });
  }
};

// Step 2 of any bulk-product workbook: apply brand / model / category
// dropdowns to rows 2..validationRows. MUST be called AFTER all data rows
// have been added — `ws.getCell()` auto-materializes rows up to the index
// referenced, so calling this first would push real data below the dropdown
// "ghost rows" and make the file appear empty when opened. The brand /
// model / category cells the validation targets are derived from the
// supplied `columns` schema so this helper works with any column layout.
const applyExcelSheetDropdowns = ({ ws, columns, brands, categories, models, validationRows }) => {
  const findCol = (key) => columns.findIndex((c) => c.key === key) + 1;
  const brandColLetter = _colLetter(findCol("brand"));
  const modelColLetter = _colLetter(findCol("model"));
  const categoryColLetter = _colLetter(findCol("category"));

  const brandEnd = Math.max(2, brands.length + 1);
  const categoryEnd = Math.max(2, categories.length + 1);
  const modelEnd = Math.max(2, models.length + 1);

  for (let i = 2; i <= validationRows; i++) {
    ws.getCell(`${brandColLetter}${i}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`_Lists!$A$2:$A$${brandEnd}`],
      showErrorMessage: true,
      errorTitle: "Invalid Brand",
      error: "Please select a Brand from the dropdown list (or leave blank to keep current).",
    };
    ws.getCell(`${modelColLetter}${i}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`_Lists!$C$2:$C$${modelEnd}`],
      showErrorMessage: true,
      errorTitle: "Invalid Model",
      error: "Please select a Model from the dropdown list (or leave blank to keep current).",
    };
    ws.getCell(`${categoryColLetter}${i}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`_Lists!$B$2:$B$${categoryEnd}`],
      showErrorMessage: true,
      errorTitle: "Invalid Category",
      error: "Please select a Category from the dropdown list (or leave blank to keep current).",
    };
  }
};

// Helpers for flattening Product fields into the shared cell format used by
// both the export and the bulk-update parser.
const _joinSpecs = (specs) =>
  Array.isArray(specs) && specs.length
    ? specs.map((s) => `${s?.key ?? ""}:${s?.value ?? ""}`).join("|")
    : "";
const _joinArr = (arr, sep) =>
  Array.isArray(arr) && arr.length
    ? arr
        .filter((x) => x !== undefined && x !== null && x !== "")
        .join(sep)
    : "";
const _joinDescription = (desc) =>
  Array.isArray(desc) ? desc.join("\n") : desc || "";
const _buildRowArrayFor = (columns, rowObj) =>
  columns.map((c) =>
    rowObj[c.key] !== undefined && rowObj[c.key] !== null ? rowObj[c.key] : "",
  );

// Serialize a product's colorVariants array into the rich bulk-upload cell
// format consumed by `bulkCreateProducts`:
//   colorName;sku;price;mrp;wholesalePrice;wholesaleMinQty;countInStock;img1,img2
// Multiple variants are joined by "||". A trailing "||" is intentionally
// appended so the parser's rich-format detection
//   (raw.includes("||") || (raw.includes(";") && !raw.includes(":")))
// always picks the rich branch — without it a single-variant row whose only
// image URL contains "://" would be misread as the legacy "name:images"
// format and stripped of price/stock/sku data on restore.
const _serializeVariantsForCreate = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) return "";
  const parts = variants.map((v) => {
    const fields = [
      v.colorName || "",
      v.sku || "",
      v.price !== undefined && v.price !== null ? v.price : "",
      v.mrp !== undefined && v.mrp !== null ? v.mrp : "",
      v.wholesalePrice !== undefined && v.wholesalePrice !== null ? v.wholesalePrice : "",
      v.wholesaleMinQty !== undefined && v.wholesaleMinQty !== null ? v.wholesaleMinQty : "",
      v.countInStock !== undefined && v.countInStock !== null ? v.countInStock : 0,
      (v.images || []).join(","),
    ];
    return fields.join(";");
  });
  return parts.join("||") + "||";
};

// Column schema for the products BACKUP EXPORT — mirrors the bulk-CREATE
// template (`downloadProductTemplate`) so an exported file can be
// re-uploaded via Admin → Products → Bulk to fully reconstruct the catalog
// after a wipe. The first 24 columns match the upload template EXACTLY
// (same order, same headers including the trailing " *" markers). Five
// extras the upload parser also reads are appended after so the backup
// captures every persisted field — extra columns are silently ignored by
// the parser, so they don't break legacy templates either.
const EXPORT_BACKUP_COLUMNS = [
  { header: "name *", key: "name", width: 36 },
  { header: "brand *", key: "brand", width: 18 },
  { header: "model *", key: "model", width: 26 },
  { header: "category *", key: "category", width: 18 },
  { header: "SKU", key: "SKU", width: 22 },
  { header: "price", key: "price", width: 12 },
  { header: "mrp", key: "mrp", width: 12 },
  { header: "wholesalePrice", key: "wholesalePrice", width: 16 },
  { header: "wholesaleMinQty", key: "wholesaleMinQty", width: 16 },
  { header: "countInStock", key: "countInStock", width: 14 },
  { header: "colorVariants", key: "colorVariants", width: 80 },
  { header: "description", key: "description", width: 50 },
  { header: "images", key: "images", width: 60 },
  { header: "videoUrl", key: "videoUrl", width: 40 },
  { header: "specs", key: "specs", width: 50 },
  { header: "inTheBox", key: "inTheBox", width: 30 },
  { header: "warrantySummary", key: "warrantySummary", width: 30 },
  { header: "coveredInWarranty", key: "coveredInWarranty", width: 28 },
  { header: "warrantyServiceType", key: "warrantyServiceType", width: 26 },
  { header: "warrantyTnC", key: "warrantyTnC", width: 22 },
  { header: "countryOfOrigin", key: "countryOfOrigin", width: 18 },
  { header: "packer", key: "packer", width: 30 },
  { header: "highlights", key: "highlights", width: 40 },
  { header: "descriptionPoints", key: "descriptionPoints", width: 40 },
  // Extras the bulk-create parser also reads (kept for true round-trip fidelity).
  { header: "productType", key: "productType", width: 22 },
  { header: "cashback", key: "cashback", width: 12 },
  { header: "colors", key: "colors", width: 22 },
  { header: "warrantyPeriod", key: "warrantyPeriod", width: 18 },
  { header: "warrantyPolicy", key: "warrantyPolicy", width: 22 },
];

// @desc    Export all products as a FULL BACKUP file in the SAME format as
//          the bulk-CREATE template (`downloadProductTemplate`). The file
//          can be re-uploaded via Admin → Products → Bulk (Upload) to fully
//          reconstruct the catalog after a wipe. One row per product; color
//          variants are packed into the `colorVariants` cell in the rich
//          `name;sku;price;mrp;wsPrice;wsMinQty;stock;img1,img2||...` format
//          consumed by `bulkCreateProducts`.
// @route   GET /api/admin/products/export
// @access  Private/Admin
export const exportProductsBackup = async (req, res) => {
  try {
    const [brands, categories, models, products] = await Promise.all([
      Brand.find({}, "name").sort({ name: 1 }),
      Category.find({}, "name").sort({ name: 1 }),
      Model.find({}, "name").sort({ name: 1 }),
      Product.find({})
        .populate("brand", "name")
        .populate("category", "name")
        .populate("model", "name")
        .sort({ name: 1 }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PlusWay Admin";
    workbook.lastModifiedBy = "PlusWay Admin";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Sheet name matches the upload template's default sheet ("Products")
    // so XLSX.SheetNames[0] picks the same sheet on re-upload.
    const ws = workbook.addWorksheet("Products");

    // STEP 1: header + hidden _Lists sheet ONLY. Dropdowns are applied
    // AFTER data rows are written, otherwise ExcelJS auto-materializes empty
    // rows for the dropdown range and pushes the real data far below them.
    setupExcelSheetHeader({
      workbook,
      ws,
      columns: EXPORT_BACKUP_COLUMNS,
      brands,
      categories,
      models,
    });

    // ---- Data rows ---- one row per product, matching the bulk-create
    // convention: top-level pricing/stock live on the product row ONLY when
    // there are no color variants. With variants, those top-level cells stay
    // blank and the parser derives them from the first variant during upload.
    products.forEach((p) => {
      const hasVariants = Array.isArray(p.colorVariants) && p.colorVariants.length > 0;
      const rowObj = {
        name: p.name || "",
        brand: p.brand?.name || "",
        model: p.model?.name || "",
        category: p.category?.name || "",
        SKU: p.code || "",
        price: hasVariants ? "" : (p.price ?? ""),
        mrp: hasVariants ? "" : (p.mrp ?? ""),
        wholesalePrice: hasVariants ? "" : (p.wholesalePrice ?? ""),
        wholesaleMinQty: hasVariants ? "" : (p.wholesaleMinQty ?? ""),
        countInStock: hasVariants ? "" : (p.countInStock ?? ""),
        colorVariants: hasVariants ? _serializeVariantsForCreate(p.colorVariants) : "",
        description: _joinDescription(p.description),
        images: _joinArr(p.images, "|"),
        videoUrl: p.videoUrl || "",
        specs: _joinSpecs(p.details?.specs),
        inTheBox: p.details?.inTheBox || "",
        warrantySummary: p.details?.warranty?.summary || "",
        coveredInWarranty: p.details?.warranty?.coveredInWarranty || "",
        warrantyServiceType: p.details?.warranty?.serviceType || "",
        warrantyTnC: p.details?.warranty?.tnc || "",
        countryOfOrigin: p.details?.countryOfOrigin || "",
        packer: p.details?.packer || "",
        highlights: _joinArr(p.details?.highlights, "|"),
        descriptionPoints: _joinArr(p.details?.descriptionPoints, "|"),
        productType: p.productType || "",
        cashback: p.cashback ?? "",
        colors: _joinArr(p.colors, ","),
        warrantyPeriod: p.details?.warranty?.period || "",
        warrantyPolicy: p.details?.warranty?.policy || "",
      };
      const pRow = ws.addRow(_buildRowArrayFor(EXPORT_BACKUP_COLUMNS, rowObj));
      pRow.alignment = { vertical: "top", wrapText: false };
    });

    // STEP 2: dropdowns AFTER data rows. Pad ~200 rows beyond the last data
    // row so admins can add brand-new products into the same file and still
    // get the brand / model / category dropdowns.
    const lastDataRow = ws.lastRow ? ws.lastRow.number : 1;
    applyExcelSheetDropdowns({
      ws,
      columns: EXPORT_BACKUP_COLUMNS,
      brands,
      categories,
      models,
      validationRows: Math.max(lastDataRow + 200, 1000),
    });

    // ---- Instructions sheet ----
    const instr = workbook.addWorksheet("Instructions");
    instr.columns = [{ width: 38 }, { width: 78 }];
    const instructionRows = [
      ["PRODUCTS BACKUP — Restore via Bulk Upload", ""],
      ["", ""],
      ["What is this file?", "A complete backup of every product, in the EXACT same format as the bulk-upload template (Admin → Products → Bulk → Download Template). One row per product."],
      ["How to restore", "If the catalog is wiped, upload this file via Admin → Products → Bulk (Upload). Every product is recreated with its SKU, pricing, variants, images, specs, warranty, etc."],
      ["", ""],
      ["1. Columns 1–4 (name, brand, model, category)", "Required on every row. Brand / model / category cells already have dropdowns matching the live admin lists."],
      ["2. SKU", "Each product's existing code is preserved. If a SKU cell is left blank during upload, a new code (PW-XXXXXX) is auto-generated."],
      ["3. Top-level price / mrp / wholesalePrice / wholesaleMinQty / countInStock", "Filled ONLY when the product has no color variants. For products with variants these stay blank — the parser derives them from the first variant."],
      ["", ""],
      ["colorVariants cell", "Each variant is a ';'-joined record:  colorName;sku;price;mrp;wholesalePrice;wholesaleMinQty;countInStock;img1,img2"],
      ["", "Multiple variants are joined by '||'. A trailing '||' is included intentionally so the parser detects rich format even when an image URL contains a colon (e.g. https://...)."],
      ["", "Example:  Black;PW-BLA-001;4500;5500;3800;10;50;https://server/img1.jpg,https://server/img2.jpg||White;PW-WHI-002;4700;5500;3900;10;20;https://server/img3.jpg||"],
      ["", ""],
      ["images (top-level)", "Pipe-separated URLs:  url1|url2|url3"],
      ["specs", "Pipe-separated key:value pairs:  Color:Black|RAM:8GB|Storage:256GB"],
      ["highlights / descriptionPoints", "Pipe-separated bullets:  Fast Charging|5G Ready"],
      ["colors", "Comma-separated:  Black,White,Gold"],
      ["description", "Use Alt+Enter (Excel) for paragraph breaks; stored as \\n in the cell. Each paragraph becomes one entry in the product's description array."],
      ["", ""],
      ["IMPORTANT — Restore vs Update", "This file is for RESTORE (re-uploading after a wipe). Each row CREATES a new product. If a product with the same name already exists, that row FAILS with \"already exists\". To edit existing products instead, use Admin → Products → Update (Bulk Update Products)."],
      ["Brands / Models / Categories must exist first", "Create them via Admin → Brands / Models / Categories before restoring. The upload parser resolves names → IDs."],
      ["Extra columns", "productType, cashback, colors, warrantyPeriod, warrantyPolicy are exported for full fidelity. The upload parser also reads them."],
      ["Max upload size", "10 MB"],
    ];
    instructionRows.forEach((r) => instr.addRow(r));
    instr.getRow(1).font = { bold: true, size: 13, color: { argb: "FF4F46E5" } };
    [3, 4, 6, 7, 8, 10, 11, 14, 15, 16, 17, 18, 20, 21, 22, 23].forEach((rowNum) => {
      const cell = instr.getRow(rowNum).getCell(1);
      if (cell) cell.font = { bold: true };
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=plusway_products_backup.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating products backup:", error);
    res.status(500).json({ message: "Failed to generate backup", error: error.message });
  }
};

// @desc    Download template for bulk price update
// @route   GET /api/admin/products/bulk-price-template
// @access  Private/Admin
export const downloadPriceUpdateTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Bulk Price Update");

    ws.columns = [
      { header: "SKU *", key: "SKU", width: 20 },
      { header: "Price *", key: "Price", width: 15 },
      { header: "MRP", key: "MRP", width: 15 },
      { header: "WholesalePrice", key: "WholesalePrice", width: 15 },
      { header: "WholesaleMinQty", key: "WholesaleMinQty", width: 15 },
    ];

    ws.getRow(1).font = { bold: true };
    ws.addRow({ SKU: "PW-123456", Price: 500, MRP: 600, WholesalePrice: 450, WholesaleMinQty: 10 });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=plusway_bulk_price_update.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Failed to generate template", error: error.message });
  }
};

// @desc    Bulk update product prices
// @route   POST /api/admin/products/bulk-update-price
// @access  Private/Admin
export const bulkUpdatePrices = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No Excel file provided" });
  }

  const results = { success: [], errors: [] };

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    const rows = rawRows.map(row => {
      const cleanRow = {};
      for (const key in row) {
        cleanRow[key.replace(/\s*\*\s*$/, '').trim()] = row[key];
      }
      return cleanRow;
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const sku = String(row.SKU || "").trim();

      if (!sku || !row.Price) {
        results.errors.push({ row: rowNum, error: "Missing SKU or Price" });
        continue;
      }

      try {
        // 1. Try product-level code first
        let product = await Product.findOne({ code: sku });

        if (product) {
          // Update product-level pricing
          const updateData = { price: Number(row.Price) };
          if (row.MRP !== "" && row.MRP !== undefined) updateData.mrp = Number(row.MRP);
          if (row.WholesalePrice !== "" && row.WholesalePrice !== undefined) updateData.wholesalePrice = Number(row.WholesalePrice);
          if (row.WholesaleMinQty !== "" && row.WholesaleMinQty !== undefined) updateData.wholesaleMinQty = Number(row.WholesaleMinQty);
          await Product.findByIdAndUpdate(product._id, updateData);
          results.success.push({ row: rowNum, sku, type: "product" });
          continue;
        }

        // 2. Try variant SKU — find product that has a colorVariant with matching sku
        product = await Product.findOne({ "colorVariants.sku": sku });

        if (product) {
          const variantIdx = product.colorVariants.findIndex(v => v.sku === sku);
          if (variantIdx !== -1) {
            // Build $set payload using positional $ operator for reliable subdoc update
            const setFields = {
              [`colorVariants.${variantIdx}.price`]: Number(row.Price),
            };
            if (row.MRP !== "" && row.MRP !== undefined) setFields[`colorVariants.${variantIdx}.mrp`] = Number(row.MRP);
            if (row.WholesalePrice !== "" && row.WholesalePrice !== undefined) setFields[`colorVariants.${variantIdx}.wholesalePrice`] = Number(row.WholesalePrice);
            if (row.WholesaleMinQty !== "" && row.WholesaleMinQty !== undefined) setFields[`colorVariants.${variantIdx}.wholesaleMinQty`] = Number(row.WholesaleMinQty);

            // Re-derive product-level price from first variant (variantIdx 0) or the updated one if it's first
            const isFirstVariant = variantIdx === 0;
            if (isFirstVariant) {
              setFields.price = Number(row.Price);
              if (row.MRP !== "" && row.MRP !== undefined) setFields.mrp = Number(row.MRP);
              if (row.WholesalePrice !== "" && row.WholesalePrice !== undefined) setFields.wholesalePrice = Number(row.WholesalePrice);
              if (row.WholesaleMinQty !== "" && row.WholesaleMinQty !== undefined) setFields.wholesaleMinQty = Number(row.WholesaleMinQty);
            }

            await Product.updateOne({ _id: product._id }, { $set: setFields });

            results.success.push({
              row: rowNum,
              sku,
              type: "variant",
              colorName: product.colorVariants[variantIdx].colorName,
              productName: product.name,
            });
          }
          continue;
        }

        // 3. Nothing found
        results.errors.push({ row: rowNum, error: `SKU ${sku} not found` });

      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
      }
    }

    try { fs.unlinkSync(req.file.path); } catch (_) {}

    const statusCode = results.success.length > 0 ? 200 : 400;
    res.status(statusCode).json({
      message: `Price update complete. ${results.success.length} updated, ${results.errors.length} failed.`,
      results
    });
  } catch (error) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    res.status(500).json({ message: "Bulk update failed", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK UPDATE PRODUCTS BY SKU
//
// SKU-keyed bulk update flow. One Excel sheet, one row per SKU. Backend
// auto-detects whether each SKU is a product-level (Product.code) or a
// color-variant (Product.colorVariants[].sku) SKU and updates the right thing.
//
// Design choices (see plan):
//  - SKU column is the lookup key, never written.
//  - Empty cell = no change. Literal token "__CLEAR__" clears an optional string field.
//  - Brand / Model / Category are name-keyed dropdowns; backend resolves to ObjectId.
//  - Variant rows that supply product-level columns get a per-row warning; those
//    columns are ignored.
//  - Ambiguous variant SKUs (matching > 1 product) fail that row.
//  - Images: pipe-separated URLs replace the existing array.
// ─────────────────────────────────────────────────────────────────────────────

// Variant-applicable column keys (also fine on a product-level row with no variants).
const VARIANT_COLUMN_KEYS = new Set([
  "colorName",
  "price",
  "mrp",
  "wholesalePrice",
  "wholesaleMinQty",
  "countInStock",
  "images",
]);

// Product-level only column keys (apply to top-level Product fields).
const PRODUCT_LEVEL_COLUMN_KEYS = new Set([
  "name",
  "description",
  "cashback",
  "brand",
  "model",
  "category",
  "productType",
  "videoUrl",
  "specs",
  "inTheBox",
  "warrantyPeriod",
  "warrantyPolicy",
  "warrantySummary",
  "coveredInWarranty",
  "warrantyServiceType",
  "warrantyTnC",
  "highlights",
  "descriptionPoints",
  "countryOfOrigin",
  "packer",
  "colors",
]);

// Treat blank cell values as "no change".
const isBlank = (v) => v === "" || v === undefined || v === null;
// "__CLEAR__" explicitly clears an optional string field.
const isClearToken = (v) =>
  typeof v === "string" && v.trim().toUpperCase() === "__CLEAR__";

// @desc    Download Excel template for bulk product update (SKU-keyed)
// @route   GET /api/admin/products/bulk-update-template
// @access  Private/Admin
export const downloadBulkUpdateTemplate = async (req, res) => {
  try {
    const [brands, categories, models, sampleProductWithVariants, sampleProductSimple] = await Promise.all([
      Brand.find({}, "name").sort({ name: 1 }),
      Category.find({}, "name").sort({ name: 1 }),
      Model.find({}, "name").sort({ name: 1 }),
      // Live example: a product that has at least one color variant with an SKU
      Product.findOne({ "colorVariants.0.sku": { $exists: true, $ne: "" } }, "name code colorVariants brand model category").populate("brand model category", "name"),
      // Live example: a product without color variants but with a code
      Product.findOne({ code: { $exists: true, $ne: "" }, $or: [{ colorVariants: { $exists: false } }, { colorVariants: { $size: 0 } }] }, "name code price mrp wholesalePrice wholesaleMinQty countInStock brand model category").populate("brand model category", "name"),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PlusWay Admin";
    workbook.lastModifiedBy = "PlusWay Admin";
    workbook.created = new Date();
    workbook.modified = new Date();

    // 1. Data sheet (must be first so it is parsed as the default sheet)
    const ws = workbook.addWorksheet("Bulk Update Products");

    // STEP 1: header + hidden _Lists sheet (no dropdowns yet — applied after
    // the example rows so ExcelJS doesn't auto-materialize ghost rows above them).
    setupExcelSheetHeader({
      workbook,
      ws,
      columns: BULK_PRODUCT_COLUMNS,
      brands,
      categories,
      models,
    });

    // Example rows pulled live from the DB so admins see real SKUs to template against.
    const variantExampleRow = {};
    const productExampleRow = {};

    if (sampleProductWithVariants && sampleProductWithVariants.colorVariants?.length) {
      const v = sampleProductWithVariants.colorVariants[0];
      variantExampleRow.SKU = v.sku || "";
      variantExampleRow.colorName = v.colorName || "";
      if (v.price !== undefined) variantExampleRow.price = v.price;
      if (v.mrp !== undefined) variantExampleRow.mrp = v.mrp;
      if (v.wholesalePrice !== undefined) variantExampleRow.wholesalePrice = v.wholesalePrice;
      if (v.wholesaleMinQty !== undefined) variantExampleRow.wholesaleMinQty = v.wholesaleMinQty;
      if (v.countInStock !== undefined) variantExampleRow.countInStock = v.countInStock;
      if (v.images?.length) variantExampleRow.images = v.images.join(",");
    } else {
      variantExampleRow.SKU = "PW-BLA-001";
      variantExampleRow.colorName = "Black";
      variantExampleRow.price = 4500;
      variantExampleRow.mrp = 5500;
      variantExampleRow.wholesalePrice = 3800;
      variantExampleRow.wholesaleMinQty = 10;
      variantExampleRow.countInStock = 50;
      variantExampleRow.images = "http://server/uploads/img1.jpg,http://server/uploads/img2.jpg";
    }

    if (sampleProductSimple) {
      productExampleRow.SKU = sampleProductSimple.code || "";
      productExampleRow.name = sampleProductSimple.name || "";
      productExampleRow.price = sampleProductSimple.price ?? "";
      productExampleRow.mrp = sampleProductSimple.mrp ?? "";
      productExampleRow.wholesalePrice = sampleProductSimple.wholesalePrice ?? "";
      productExampleRow.wholesaleMinQty = sampleProductSimple.wholesaleMinQty ?? "";
      productExampleRow.countInStock = sampleProductSimple.countInStock ?? "";
      productExampleRow.brand = sampleProductSimple.brand?.name || (brands[0]?.name ?? "");
      productExampleRow.model = sampleProductSimple.model?.name || (models[0]?.name ?? "");
      productExampleRow.category = sampleProductSimple.category?.name || (categories[0]?.name ?? "");
    } else {
      productExampleRow.SKU = "PW-BAT-IP14P-001";
      productExampleRow.name = "Battery iPhone 14 Pro";
      productExampleRow.price = 2500;
      productExampleRow.mrp = 3000;
      productExampleRow.wholesalePrice = 2100;
      productExampleRow.wholesaleMinQty = 10;
      productExampleRow.countInStock = 50;
      productExampleRow.brand = brands[0]?.name || "Apple";
      productExampleRow.model = models[0]?.name || "Apple iPhone 14 Pro";
      productExampleRow.category = categories[0]?.name || "Battery";
    }

    const row2 = ws.addRow(_buildRowArrayFor(BULK_PRODUCT_COLUMNS, variantExampleRow));
    const row3 = ws.addRow(_buildRowArrayFor(BULK_PRODUCT_COLUMNS, productExampleRow));
    [row2, row3].forEach((r) => {
      r.height = 20;
      r.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "FF64748B" } };
        cell.alignment = { vertical: "middle" };
      });
    });

    // STEP 2: dropdowns. Applied AFTER the example rows so they aren't pushed
    // below auto-materialized ghost rows.
    applyExcelSheetDropdowns({
      ws,
      columns: BULK_PRODUCT_COLUMNS,
      brands,
      categories,
      models,
      validationRows: 1000,
    });

    // Instructions sheet.
    const instr = workbook.addWorksheet("Instructions");
    instr.columns = [{ width: 38 }, { width: 70 }];
    const instructionRows = [
      ["INSTRUCTIONS — BULK UPDATE PRODUCTS BY SKU", ""],
      ["", ""],
      ["1. SKU column (column A)", "This is the LOOKUP KEY. It is never modified. Required on every row."],
      ["", "Use a product-level SKU (Product.code) to update a top-level product."],
      ["", "Use a color-variant SKU to update a single color variant of a product."],
      ["", ""],
      ["2. Empty cell behavior", "An empty cell means \"do not change\" that field. The product/variant keeps its current value."],
      ["3. Clear a string field", "Type the literal token __CLEAR__ in a cell to reset an optional string field to empty."],
      ["", ""],
      ["4. Example rows (row 2 & 3)", "Row 2 = a real color-VARIANT example (SKU + variant fields filled). Row 3 = a real product-LEVEL example. Overwrite or delete before uploading."],
      ["", ""],
      ["VARIANT ROWS", "When the SKU matches a color variant, only these columns are honored:"],
      ["", "colorName, price, mrp, wholesalePrice, wholesaleMinQty, countInStock, images"],
      ["", "Other columns (brand, model, category, name, specs, warranty*, etc.) are IGNORED with a per-row warning in the upload summary."],
      ["", ""],
      ["PRODUCT-LEVEL ROWS", "When the SKU matches Product.code, every column is editable except SKU (immutable) and slug (auto-managed)."],
      ["", ""],
      ["brand / model / category", "Pick from the dropdown. Must match an existing entry. Case-insensitive. To add a new one, create it via Admin → Brands / Models / Categories first."],
      ["images", "Comma- or pipe-separated full URLs replace the existing image list:  url1,url2,url3  (pipes also work: url1|url2|url3)"],
      ["specs", "Pipe-separated key:value pairs replace the existing specs list:  Color:Black|RAM:8GB|Storage:256GB"],
      ["highlights / descriptionPoints", "Pipe-separated bullets:  Fast Charging|5G Ready"],
      ["colors", "Comma-separated:  Black,White,Gold"],
      ["description", "Use \\n inside the cell for paragraph breaks (Alt+Enter in Excel)."],
      ["", ""],
      ["Things you CANNOT change here", "SKU itself, slug, reviews, rating, numReviews. Use the per-product edit page for those."],
      ["Ambiguous variant SKU", "If the same variant SKU exists on more than one product, that row fails with an error. Fix the duplicate via the product edit page."],
      ["Top-level price on a multi-variant product", "Allowed, but the value is normally derived from the first variant; it may be overwritten the next time variants change."],
      ["Max file size", "10 MB"],
    ];
    instructionRows.forEach((r) => instr.addRow(r));
    instr.getRow(1).font = { bold: true, size: 13, color: { argb: "FF4F46E5" } };
    [3, 7, 8, 10, 12, 16, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28].forEach((rowNum) => {
      const cell = instr.getRow(rowNum).getCell(1);
      if (cell) cell.font = { bold: true };
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=plusway_bulk_update_products.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating bulk-update template:", error);
    res.status(500).json({ message: "Failed to generate template", error: error.message });
  }
};

// @desc    Bulk update products / color variants by SKU
// @route   POST /api/admin/products/bulk-update
// @access  Private/Admin
export const bulkUpdateProductsBySku = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No Excel file provided" });
  }

  const results = { success: [], errors: [] };

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    // Normalize keys (strip trailing " *" from required headers).
    const rows = rawRows.map((row) => {
      const cleanRow = {};
      for (const key in row) {
        const cleanKey = key.replace(/\s*\*\s*$/, "").trim();
        cleanRow[cleanKey] = row[key];
      }
      return cleanRow;
    });

    if (!rows.length) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(400).json({ message: "Excel file is empty or has no data rows" });
    }

    // Pre-fetch maps for name → ObjectId resolution.
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

    // Per-row parsing helpers (mirror the create flow).
    const parsePipeList = (v) =>
      String(v).split("|").map((s) => s.trim()).filter(Boolean);
    const parseCommaList = (v) =>
      String(v).split(",").map((s) => s.trim()).filter(Boolean);
    // Image lists accept BOTH "," and "|" as delimiters — neither character
    // is legal in a URL, so the split is unambiguous and admins can use
    // whichever feels natural.
    const parseImageList = (v) =>
      String(v).split(/[|,]/).map((s) => s.trim()).filter(Boolean);
    const parseSpecs = (v) =>
      String(v)
        .split("|")
        .map((s) => {
          const colonIdx = s.indexOf(":");
          if (colonIdx === -1) return null;
          return { key: s.substring(0, colonIdx).trim(), value: s.substring(colonIdx + 1).trim() };
        })
        .filter(Boolean);
    const parseDescription = (v) =>
      String(v).split("\n").map((p) => p.trim()).filter(Boolean);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const sku = String(row.SKU || "").trim();

      if (!sku) {
        results.errors.push({ row: rowNum, name: "?", error: "Missing SKU" });
        continue;
      }

      try {
        // 1) Try product-level: Product.code.
        const productByCode = await Product.findOne({ code: sku });
        if (productByCode) {
          const $set = {};
          const rowWarnings = [];

          // Helper to set an optional string field with __CLEAR__ support.
          const setStringField = (field, value) => {
            if (isBlank(value)) return; // unchanged
            if (isClearToken(value)) { $set[field] = ""; return; }
            $set[field] = String(value).trim();
          };

          // Helper for numeric fields. Blank = unchanged. __CLEAR__ not meaningful here.
          const setNumericField = (field, value) => {
            if (isBlank(value)) return;
            const n = Number(value);
            if (Number.isNaN(n)) {
              throw new Error(`Field "${field}" must be a number (got "${value}")`);
            }
            $set[field] = n;
          };

          if (!isBlank(row.name)) {
            const trimmed = String(row.name).trim();
            if (!trimmed) throw new Error("name cannot be empty");
            $set.name = trimmed;
          }

          if (!isBlank(row.description)) {
            $set.description = isClearToken(row.description) ? [] : parseDescription(row.description);
          }

          setNumericField("price", row.price);
          setNumericField("mrp", row.mrp);
          setNumericField("wholesalePrice", row.wholesalePrice);
          setNumericField("wholesaleMinQty", row.wholesaleMinQty);
          setNumericField("cashback", row.cashback);
          setNumericField("countInStock", row.countInStock);

          // Brand / Model / Category resolution.
          if (!isBlank(row.brand)) {
            const id = brandMap[String(row.brand).toLowerCase().trim()];
            if (!id) throw new Error(`Brand "${row.brand}" not found`);
            $set.brand = id;
          }
          if (!isBlank(row.model)) {
            const id = modelMap[String(row.model).toLowerCase().trim()];
            if (!id) throw new Error(`Model "${row.model}" not found`);
            $set.model = id;
          }
          if (!isBlank(row.category)) {
            const id = categoryMap[String(row.category).toLowerCase().trim()];
            if (!id) throw new Error(`Category "${row.category}" not found`);
            $set.category = id;
          }

          setStringField("productType", row.productType);
          setStringField("videoUrl", row.videoUrl);

          if (!isBlank(row.images)) {
            $set.images = isClearToken(row.images) ? [] : parseImageList(row.images);
          }

          if (!isBlank(row.colors)) {
            $set.colors = isClearToken(row.colors) ? [] : parseCommaList(row.colors);
          }

          // Nested details fields use dotted-path $set so we don't clobber sibling fields.
          if (!isBlank(row.specs)) {
            $set["details.specs"] = isClearToken(row.specs) ? [] : parseSpecs(row.specs);
          }
          if (!isBlank(row.inTheBox)) {
            $set["details.inTheBox"] = isClearToken(row.inTheBox) ? "" : String(row.inTheBox).trim();
          }
          if (!isBlank(row.warrantyPeriod)) {
            $set["details.warranty.period"] = isClearToken(row.warrantyPeriod) ? "" : String(row.warrantyPeriod).trim();
          }
          if (!isBlank(row.warrantyPolicy)) {
            $set["details.warranty.policy"] = isClearToken(row.warrantyPolicy) ? "" : String(row.warrantyPolicy).trim();
          }
          if (!isBlank(row.warrantySummary)) {
            $set["details.warranty.summary"] = isClearToken(row.warrantySummary) ? "" : String(row.warrantySummary).trim();
          }
          if (!isBlank(row.coveredInWarranty)) {
            $set["details.warranty.coveredInWarranty"] = isClearToken(row.coveredInWarranty) ? "" : String(row.coveredInWarranty).trim();
          }
          if (!isBlank(row.warrantyServiceType)) {
            $set["details.warranty.serviceType"] = isClearToken(row.warrantyServiceType) ? "" : String(row.warrantyServiceType).trim();
          }
          if (!isBlank(row.warrantyTnC)) {
            $set["details.warranty.tnc"] = isClearToken(row.warrantyTnC) ? "" : String(row.warrantyTnC).trim();
          }
          if (!isBlank(row.highlights)) {
            $set["details.highlights"] = isClearToken(row.highlights) ? [] : parsePipeList(row.highlights);
          }
          if (!isBlank(row.descriptionPoints)) {
            $set["details.descriptionPoints"] = isClearToken(row.descriptionPoints) ? [] : parsePipeList(row.descriptionPoints);
          }
          if (!isBlank(row.countryOfOrigin)) {
            $set["details.countryOfOrigin"] = isClearToken(row.countryOfOrigin) ? "" : String(row.countryOfOrigin).trim();
          }
          if (!isBlank(row.packer)) {
            $set["details.packer"] = isClearToken(row.packer) ? "" : String(row.packer).trim();
          }

          // colorName on a product-level row is meaningless — warn rather than error.
          if (!isBlank(row.colorName)) {
            rowWarnings.push(`colorName ignored — provide a variant SKU to update a variant's color name`);
          }

          // Warn admins who set top-level pricing on a multi-variant product, since
          // those fields are normally derived from the first variant and may be
          // overwritten the next time variants change.
          if (
            productByCode.colorVariants?.length > 0 &&
            ["price", "mrp", "wholesalePrice", "wholesaleMinQty", "countInStock"].some((k) => !isBlank(row[k]))
          ) {
            rowWarnings.push(
              `Top-level price/stock fields set on a product that has color variants — they may be overridden when variants are next updated.`,
            );
          }

          if (Object.keys($set).length === 0) {
            results.success.push({
              row: rowNum,
              sku,
              type: "product",
              name: productByCode.name,
              warnings: ["No editable fields filled — row had no effect."],
            });
            continue;
          }

          await Product.findByIdAndUpdate(productByCode._id, { $set });
          results.success.push({
            row: rowNum,
            sku,
            type: "product",
            name: productByCode.name,
            warnings: rowWarnings,
          });
          continue;
        }

        // 2) Try variant-level: colorVariants.sku. Use find() to detect ambiguity.
        const variantMatches = await Product.find(
          { "colorVariants.sku": sku },
          "_id name colorVariants price mrp wholesalePrice wholesaleMinQty countInStock",
        );

        if (variantMatches.length === 0) {
          results.errors.push({ row: rowNum, name: "?", error: `SKU ${sku} not found` });
          continue;
        }
        if (variantMatches.length > 1) {
          results.errors.push({
            row: rowNum,
            name: "?",
            error: `Variant SKU ${sku} is ambiguous (matches ${variantMatches.length} products)`,
          });
          continue;
        }

        const parent = variantMatches[0];
        const variantIdx = parent.colorVariants.findIndex((v) => v.sku === sku);
        if (variantIdx === -1) {
          // Shouldn't happen, but guard anyway.
          results.errors.push({ row: rowNum, name: parent.name, error: `Variant SKU ${sku} not found on parent` });
          continue;
        }

        const $set = {};
        const rowWarnings = [];
        const base = `colorVariants.${variantIdx}`;

        // colorName is required by schema — refuse to blank it.
        if (!isBlank(row.colorName)) {
          if (isClearToken(row.colorName)) {
            throw new Error("colorName is required and cannot be cleared");
          }
          const trimmed = String(row.colorName).trim();
          if (!trimmed) throw new Error("colorName cannot be empty");
          $set[`${base}.colorName`] = trimmed;
        }

        const setVariantNumeric = (key) => {
          if (isBlank(row[key])) return;
          const n = Number(row[key]);
          if (Number.isNaN(n)) {
            throw new Error(`Field "${key}" must be a number (got "${row[key]}")`);
          }
          $set[`${base}.${key}`] = n;
        };
        setVariantNumeric("price");
        setVariantNumeric("mrp");
        setVariantNumeric("wholesalePrice");
        setVariantNumeric("wholesaleMinQty");
        setVariantNumeric("countInStock");

        if (!isBlank(row.images)) {
          $set[`${base}.images`] = isClearToken(row.images) ? [] : parseImageList(row.images);
        }

        // Mirror to top-level when updating the first variant (matches existing bulkUpdatePrices).
        if (variantIdx === 0) {
          ["price", "mrp", "wholesalePrice", "wholesaleMinQty"].forEach((k) => {
            const dotted = `${base}.${k}`;
            if (dotted in $set) $set[k] = $set[dotted];
          });
        }

        // Re-sum parent countInStock if this variant's countInStock changed.
        if (`${base}.countInStock` in $set) {
          const newStock = $set[`${base}.countInStock`];
          let parentStock = 0;
          parent.colorVariants.forEach((v, idx) => {
            parentStock += idx === variantIdx ? newStock : Number(v.countInStock || 0);
          });
          $set.countInStock = parentStock;
        }

        // Collect warnings for product-level columns supplied on a variant row.
        for (const colKey of Object.keys(row)) {
          if (colKey === "SKU") continue;
          if (PRODUCT_LEVEL_COLUMN_KEYS.has(colKey) && !isBlank(row[colKey])) {
            rowWarnings.push(`${colKey}: ignored on variant row`);
          }
        }

        const onlyMutatedFields = Object.keys($set).filter((k) => k.startsWith(base));
        if (onlyMutatedFields.length === 0) {
          results.success.push({
            row: rowNum,
            sku,
            type: "variant",
            name: parent.name,
            colorName: parent.colorVariants[variantIdx].colorName,
            warnings: ["No variant fields filled — row had no effect.", ...rowWarnings],
          });
          continue;
        }

        await Product.updateOne({ _id: parent._id }, { $set });
        results.success.push({
          row: rowNum,
          sku,
          type: "variant",
          name: parent.name,
          colorName: parent.colorVariants[variantIdx].colorName,
          warnings: rowWarnings,
        });
      } catch (rowError) {
        results.errors.push({ row: rowNum, name: "?", error: rowError.message });
      }
    }

    // Save the upload file & record history (only if at least one row was processed).
    let savedFileName = req.file.filename;
    let savedFilePath = req.file.path;

    if (rows.length > 0) {
      try {
        const ext = path.extname(req.file.originalname) || ".xlsx";
        savedFileName = `${req.file.filename}${ext}`;
        savedFilePath = `${req.file.path}${ext}`;
        fs.renameSync(req.file.path, savedFilePath);

        await BulkUploadHistory.create({
          fileName: req.file.originalname,
          filePath: savedFileName,
          uploadType: "ProductsUpdate",
          totalRows: rows.length,
          successCount: results.success.length,
          errorCount: results.errors.length,
          uploadedBy: req.user._id,
        });
      } catch (historyErr) {
        // History logging is best-effort; don't fail the response.
        console.error("BulkUploadHistory write failed:", historyErr);
      }
    } else {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

    const statusCode = results.success.length > 0 ? 200 : 400;
    res.status(statusCode).json({
      message: `Update complete. ${results.success.length} updated, ${results.errors.length} failed.`,
      total: rows.length,
      successCount: results.success.length,
      errorCount: results.errors.length,
      results,
    });
  } catch (error) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    console.error("Bulk update by SKU failed:", error);
    res.status(500).json({ message: "Bulk update failed", error: error.message });
  }
};

