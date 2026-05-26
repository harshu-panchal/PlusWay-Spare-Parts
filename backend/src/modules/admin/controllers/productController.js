import Product from "../../../models/Product.js";
import Brand from "../../../models/Brand.js";
import Category from "../../../models/Category.js";
import Model from "../../../models/Model.js";
import XLSX from "xlsx";
import fs from "fs";
import ExcelJS from "exceljs";

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
      { header: "code", key: "code", example: "SKU-001", example2: "SKU-002" },
      { header: "brand *", key: "brand", example: "Samsung", example2: "Apple" },
      { header: "model *", key: "model", example: "Samsung Galaxy S23 Ultra", example2: "Apple iPhone 14 Pro" },
      { header: "category *", key: "category", example: "LCD Display", example2: "Battery" },
      { header: "productType", key: "productType", example: "LCD with Touch Screen", example2: "Li-Ion Battery" },
      { header: "price *", key: "price", example: "4500", example2: "2800" },
      { header: "mrp *", key: "mrp", example: "5500", example2: "3500" },
      { header: "wholesalePrice *", key: "wholesalePrice", example: "3800", example2: "2300" },
      { header: "wholesaleMinQty *", key: "wholesaleMinQty", example: "10", example2: "10" },
      { header: "cashback", key: "cashback", example: "100", example2: "50" },
      { header: "countInStock *", key: "countInStock", example: "50", example2: "30" },
      { header: "description", key: "description", example: "High quality original LCD display", example2: "Long lasting battery" },
      { header: "images", key: "images", example: "http://server/uploads/img1.jpg|http://server/uploads/img2.jpg", example2: "" },
      { header: "videoUrl", key: "videoUrl", example: "", example2: "" },
      { header: "colors", key: "colors", example: "Black,White,Gold", example2: "Black" },
      { header: "specs", key: "specs", example: "Color:Black|Compatibility:S23 Ultra|Type:AMOLED", example2: "Capacity:3000mAh|Voltage:3.8V" },
      { header: "inTheBox", key: "inTheBox", example: "LCD Display, Installation Guide", example2: "Battery" },
      { header: "warrantyPeriod", key: "warrantyPeriod", example: "6 Months", example2: "3 Months" },
      { header: "warrantyPolicy", key: "warrantyPolicy", example: "Replacement", example2: "Replacement" },
      { header: "warrantySummary", key: "warrantySummary", example: "Warranty void if tampered", example2: "" },
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
      // Column C: Brand
      ws.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`_Lists!$A$2:$A$${brandEnd}`],
        showErrorMessage: true,
        errorTitle: "Invalid Brand",
        error: "Please select a Brand from the dropdown list."
      };
      // Column D: Model
      ws.getCell(`D${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`_Lists!$C$2:$C$${modelEnd}`],
        showErrorMessage: true,
        errorTitle: "Invalid Model",
        error: "Please select a Model from the dropdown list."
      };
      // Column E: Category
      ws.getCell(`E${i}`).dataValidation = {
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
