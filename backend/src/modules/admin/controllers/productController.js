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
    const columns = [
      { header: "name *", key: "name", example: "LCD Screen Samsung S23 Ultra", example2: "Battery iPhone 14 Pro" },
      { header: "brand *", key: "brand", example: "Samsung", example2: "Apple" },
      { header: "model *", key: "model", example: "Samsung Galaxy S23 Ultra", example2: "Apple iPhone 14 Pro" },
      { header: "category *", key: "category", example: "LCD Display", example2: "Battery" },
      { header: "colorVariants *", key: "colorVariants", example: "Black;PW-BLA-001;4500;5500;3800;10;50;http://img1.jpg,http://img2.jpg||White;PW-WHI-002;4700;5500;3900;10;20;http://img3.jpg", example2: "Black;;4500;5500;3800;10;50;" },
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

// @desc    Export Backup Excel of all products
// @route   GET /api/admin/products/export
// @access  Private/Admin
export const exportProductsBackup = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("brand", "name")
      .populate("category", "name")
      .populate("model", "name");

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Products Backup");

    const columns = [
      { header: "ID", key: "_id", width: 24 },
      { header: "name *", key: "name", width: 28 },
      { header: "SKU", key: "code", width: 15 },
      { header: "brand *", key: "brand", width: 15 },
      { header: "model *", key: "model", width: 20 },
      { header: "category *", key: "category", width: 15 },
      { header: "productType", key: "productType", width: 15 },
      { header: "price *", key: "price", width: 10 },
      { header: "mrp *", key: "mrp", width: 10 },
      { header: "wholesalePrice *", key: "wholesalePrice", width: 15 },
      { header: "wholesaleMinQty *", key: "wholesaleMinQty", width: 15 },
      { header: "cashback", key: "cashback", width: 10 },
      { header: "countInStock *", key: "countInStock", width: 15 },
      { header: "description", key: "description", width: 30 },
      { header: "images", key: "images", width: 30 },
      { header: "videoUrl", key: "videoUrl", width: 20 },
      { header: "colors", key: "colors", width: 20 },
      { header: "colorVariants", key: "colorVariants", width: 50 },
      { header: "specs", key: "specs", width: 30 },
      { header: "inTheBox", key: "inTheBox", width: 20 },
      { header: "warrantySummary", key: "warrantySummary", width: 30 },
      { header: "coveredInWarranty", key: "coveredInWarranty", width: 30 },
      { header: "warrantyServiceType", key: "warrantyServiceType", width: 30 },
      { header: "warrantyTnC", key: "warrantyTnC", width: 30 },
      { header: "countryOfOrigin", key: "countryOfOrigin", width: 20 },
      { header: "packer", key: "packer", width: 30 },
      { header: "highlights", key: "highlights", width: 30 },
      { header: "descriptionPoints", key: "descriptionPoints", width: 30 },
      { header: "createdAt", key: "createdAt", width: 20 },
    ];

    ws.columns = columns;

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };

    products.forEach((p) => {
      ws.addRow({
        _id: p._id.toString(),
        name: p.name,
        code: p.code,
        brand: p.brand?.name || "",
        model: p.model?.name || "",
        category: p.category?.name || "",
        productType: p.productType,
        price: p.price,
        mrp: p.mrp,
        wholesalePrice: p.wholesalePrice,
        wholesaleMinQty: p.wholesaleMinQty,
        cashback: p.cashback,
        countInStock: p.countInStock,
        description: Array.isArray(p.description) ? p.description.join("\n") : (p.description || ""),
        images: p.images?.join("|") || "",
        videoUrl: p.videoUrl,
        colors: p.colors?.join(",") || "",
        colorVariants: p.colorVariants?.map(v => {
          const parts = [
            v.colorName,
            v.sku || "",
            v.price !== undefined ? v.price : "",
            v.mrp !== undefined ? v.mrp : "",
            v.wholesalePrice !== undefined ? v.wholesalePrice : "",
            v.wholesaleMinQty !== undefined ? v.wholesaleMinQty : "",
            v.countInStock !== undefined ? v.countInStock : 0,
            (v.images || []).join(","),
          ];
          return parts.join(";");
        }).join("||") || "",
        specs: p.details?.specs?.map(s => `${s.key}:${s.value}`).join("|") || "",
        inTheBox: p.details?.inTheBox,
        warrantySummary: p.details?.warranty?.summary,
        coveredInWarranty: p.details?.warranty?.coveredInWarranty,
        warrantyServiceType: p.details?.warranty?.serviceType,
        warrantyTnC: p.details?.warranty?.tnc,
        countryOfOrigin: p.details?.countryOfOrigin,
        packer: p.details?.packer,
        highlights: p.details?.highlights?.join("|") || "",
        descriptionPoints: p.details?.descriptionPoints?.join("|") || "",
        createdAt: p.createdAt,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=plusway_products_backup.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
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

