import Model from "../../../models/Model.js";
import Brand from "../../../models/Brand.js";
import XLSX from "xlsx";
import fs from "fs";
import ExcelJS from "exceljs";
import BulkUploadHistory from "../../../models/BulkUploadHistory.js";
import path from "path";


const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Get all models
// @route   GET /api/admin/models
// @access  Private/Admin
export const getModels = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.pageNumber) || 1;
  const search = req.query.search || "";
  const brand = req.query.brand;

  if (req.query.all === "true") {
    const models = await Model.find({})
      .populate("brand", "name")
      .sort({ name: 1 });
    return res.json({ models, total: models.length });
  }

  let filter = {};
  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: "i" };
  }
  if (brand && brand !== "all") {
    filter.brand = brand;
  }

  const count = await Model.countDocuments(filter);
  const models = await Model.find(filter)
    .populate("brand", "name")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ models, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Get model by ID
// @route   GET /api/admin/models/:id
// @access  Private/Admin
export const getModelById = async (req, res) => {
  const model = await Model.findById(req.params.id).populate("brand", "name");

  if (model) {
    res.json(model);
  } else {
    res.status(404).json({ message: "Model not found" });
  }
};

// @desc    Create a model
// @route   POST /api/admin/models
// @access  Private/Admin
export const createModel = async (req, res) => {
  const { name, brand, released, displaySize, image } = req.body;

  const brandDoc = await Brand.findById(brand);
  let finalName = name;
  if (brandDoc && !name.toLowerCase().startsWith(brandDoc.name.toLowerCase())) {
    finalName = `${brandDoc.name} ${name}`;
  }

  const modelExists = await Model.findOne({ name: { $regex: new RegExp(`^${finalName}$`, "i") } });
  if (modelExists) {
    return res.status(400).json({ message: "Model with this name already exists" });
  }

  const model = new Model({
    name: finalName,
    brand,
    released,
    displaySize,
    image,
  });

  const createdModel = await model.save();

  // Also update the brand to include this model
  await Brand.findByIdAndUpdate(brand, {
    $push: { models: createdModel._id },
  });

  res.status(201).json(createdModel);
};

// @desc    Update a model
// @route   PUT /api/admin/models/:id
// @access  Private/Admin
export const updateModel = async (req, res) => {
  const { name, brand, released, displaySize, image } = req.body;

  const model = await Model.findById(req.params.id);

  if (model) {
    const oldBrandId = model.brand;

    const targetBrandId = brand || model.brand;
    const brandDoc = await Brand.findById(targetBrandId);
    let finalName = name || model.name;

    if (
      brandDoc &&
      !finalName.toLowerCase().startsWith(brandDoc.name.toLowerCase())
    ) {
      finalName = `${brandDoc.name} ${finalName}`;
    }

    const modelExists = await Model.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${finalName}$`, "i") }
    });

    if (modelExists) {
      return res.status(400).json({ message: "Model with this name already exists" });
    }

    model.name = finalName;
    model.brand = targetBrandId;
    model.released = released || model.released;
    model.displaySize = displaySize || model.displaySize;
    model.image = image || model.image;

    const updatedModel = await model.save();

    // If brand changed, update both old and new brands
    if (brand && oldBrandId.toString() !== brand.toString()) {
      await Brand.findByIdAndUpdate(oldBrandId, {
        $pull: { models: updatedModel._id },
      });
      await Brand.findByIdAndUpdate(brand, {
        $push: { models: updatedModel._id },
      });
    }

    res.json(updatedModel);
  } else {
    res.status(404).json({ message: "Model not found" });
  }
};

// @desc    Delete a model
// @route   DELETE /api/admin/models/:id
// @access  Private/Admin
export const deleteModel = async (req, res) => {
  const model = await Model.findById(req.params.id);

  if (model) {
    const brandId = model.brand;
    await Model.deleteOne({ _id: model._id });

    // Also remove the model from the brand
    await Brand.findByIdAndUpdate(brandId, {
      $pull: { models: model._id },
    });

    res.json({ message: "Model removed" });
  } else {
    res.status(404).json({ message: "Model not found" });
  }
};

// @desc    Bulk delete models
// @route   DELETE /api/admin/models/bulk
// @access  Private/Admin
export const deleteBulkModels = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No model IDs provided" });
    }

    // Load models first so we can clean up Brand.models references
    const models = await Model.find({ _id: { $in: ids } }, "_id brand");

    // Group model IDs by brand for efficient $pullAll updates
    const brandToModelIds = new Map();
    models.forEach((m) => {
      const brandId = m.brand?.toString();
      if (!brandId) return;
      if (!brandToModelIds.has(brandId)) brandToModelIds.set(brandId, []);
      brandToModelIds.get(brandId).push(m._id);
    });

    // Remove model references from each affected brand
    await Promise.all(
      Array.from(brandToModelIds.entries()).map(([brandId, modelIds]) =>
        Brand.findByIdAndUpdate(brandId, { $pullAll: { models: modelIds } }),
      ),
    );

    const result = await Model.deleteMany({ _id: { $in: ids } });

    res.json({
      message: `${result.deletedCount} model(s) removed`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create models from Excel
// @route   POST /api/admin/models/bulk-upload
// @access  Private/Admin
export const bulkCreateModels = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No Excel file provided" });
  }

  const results = { success: [], errors: [] };

  try {
    // Parse Excel file
    // cellDates: true makes SheetJS return JS Date objects for date-typed cells,
    // instead of raw serial numbers — much easier to normalize the `released` column.
    const workbook = XLSX.readFile(req.file.path, { cellDates: true });
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

    // Normalize the `released` field. Excel may hand us back any of:
    //  - a JS Date object (because cellDates: true above), or
    //  - a numeric Excel serial number (safety net), or
    //  - a string the admin typed.
    // We always emit "dd/mm/yyyy" for date-shaped values, and pass freeform
    // text (e.g. "February 2023") through unchanged for backward compatibility.
    const pad2 = (n) => String(n).padStart(2, "0");
    const fmtDDMMYYYY = (d) =>
      `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
    const normalizeReleasedDate = (v) => {
      if (v === undefined || v === null || v === "") return undefined;
      if (v instanceof Date && !Number.isNaN(v.getTime())) return fmtDDMMYYYY(v);
      if (typeof v === "number" && Number.isFinite(v)) {
        // Excel serial date: days since 1900-01-01 (with the 1900 leap-year bug).
        // 25569 = days from 1900-01-01 to 1970-01-01.
        const ms = Math.round((v - 25569) * 86400 * 1000);
        const d = new Date(ms);
        if (!Number.isNaN(d.getTime())) return fmtDDMMYYYY(d);
      }
      if (typeof v === "string") {
        const s = v.trim();
        // Accept d/m/yy(yy), d-m-yy(yy), d.m.yy(yy) and normalize to dd/mm/yyyy.
        const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
        if (m) {
          let [, d, mo, y] = m;
          if (y.length === 2) y = (Number(y) >= 70 ? "19" : "20") + y;
          return `${pad2(d)}/${pad2(mo)}/${y}`;
        }
        return s; // freeform like "February 2023" — keep as-is.
      }
      return String(v).trim();
    };

    if (!rows.length) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(400).json({ message: "Excel file is empty or has no data rows" });
    }

    // Pre-fetch all brands for name → _id resolution
    const allBrands = await Brand.find({}, "name _id");
    const brandMap = {};
    allBrands.forEach((b) => {
      brandMap[b.name.toLowerCase().trim()] = b;
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        // Required field validation
        if (!row.name || !row.brand) {
          results.errors.push({
            row: rowNum,
            name: row.name || "?",
            error: "Missing required fields: name, brand",
          });
          continue;
        }

        // Resolve brand name → document
        const brandDoc = brandMap[String(row.brand).toLowerCase().trim()];
        if (!brandDoc) {
          results.errors.push({ row: rowNum, name: row.name, error: `Brand "${row.brand}" not found in database` });
          continue;
        }

        // Auto-prepend brand name if not already present (mirrors pre-save hook logic)
        let finalName = String(row.name).trim();
        if (!finalName.toLowerCase().startsWith(brandDoc.name.toLowerCase())) {
          finalName = `${brandDoc.name} ${finalName}`;
        }

        // Check model name uniqueness
        const modelExists = await Model.findOne({
          name: { $regex: new RegExp(`^${finalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        });
        if (modelExists) {
          results.errors.push({ row: rowNum, name: finalName, error: `Model "${finalName}" already exists` });
          continue;
        }

        const model = new Model({
          name: finalName,
          brand: brandDoc._id,
          released: normalizeReleasedDate(row.released),
          displaySize: row.displaySize ? String(row.displaySize).trim() : undefined,
          image: row.image ? String(row.image).trim() : undefined,
        });

        const saved = await model.save();

        // Keep Brand.models array in sync
        await Brand.findByIdAndUpdate(brandDoc._id, { $push: { models: saved._id } });

        results.success.push({ row: rowNum, name: finalName });

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
        uploadType: "Models",
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
    console.error("Bulk model upload error:", error);
    return res.status(500).json({ message: "Bulk model upload failed", error: error.message });
  }
};

// @desc    Download Excel template for bulk model upload with dropdowns
// @route   GET /api/admin/models/bulk-template
// @access  Private/Admin
export const downloadModelTemplate = async (req, res) => {
  try {
    const brands = await Brand.find({}, "name").sort({ name: 1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PlusWay Admin";
    workbook.lastModifiedBy = "PlusWay Admin";
    workbook.created = new Date();
    workbook.modified = new Date();

    // 1. Create Models Sheet FIRST so it is parsed as the default sheet
    const ws = workbook.addWorksheet("Models");

    // 2. Create Data List Sheet (hidden)
    const listsSheet = workbook.addWorksheet("_Lists");
    listsSheet.state = "veryHidden";

    // Set headers for _Lists
    listsSheet.getCell("A1").value = "Brands";

    // Populate Brands
    brands.forEach((brand, idx) => {
      listsSheet.getCell(`A${idx + 2}`).value = brand.name;
    });

    // Define columns
    // NOTE: the `released` column key MUST stay "released" so the backend parser
    // finds it. The displayed header may include format hints if we ever want.
    const columns = [
      { header: "name *", key: "name", example: "Galaxy S23 Ultra", example2: "iPhone 14 Pro" },
      { header: "brand *", key: "brand", example: "Samsung", example2: "Apple" },
      { header: "released", key: "released", example: "15/02/2023", example2: "28/09/2022" },
      { header: "image", key: "image", example: "http://server/uploads/s23ultra.jpg", example2: "" },
    ];

    ws.columns = columns.map(c => ({
      header: c.header,
      key: c.key,
      width: 28,
    }));

    // Force the `released` column to TEXT format so Excel doesn't auto-convert
    // "15/02/2023" into a date serial / locale-dependent re-format on the
    // admin's machine. Find its 1-based column index dynamically so a future
    // re-ordering of `columns` still works.
    const releasedColIdx = columns.findIndex((c) => c.key === "released") + 1;
    if (releasedColIdx > 0) {
      const releasedCol = ws.getColumn(releasedColIdx);
      releasedCol.numFmt = "@"; // text
      releasedCol.alignment = { vertical: "middle", horizontal: "left" };
    }

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

    // Data validation for brand (col B)
    const brandEnd = Math.max(2, brands.length + 1);

    // Column letter for `released` (1-indexed → A,B,C,...). Calc once.
    const releasedColLetter = releasedColIdx > 0
      ? String.fromCharCode(64 + releasedColIdx) // safe for cols 1..26
      : null;

    for (let i = 2; i <= 1000; i++) {
      ws.getCell(`B${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`_Lists!$A$2:$A$${brandEnd}`],
        showErrorMessage: true,
        errorTitle: "Invalid Brand",
        error: "Please select a Brand from the dropdown list."
      };

      // Released cells: show an in-cell prompt clarifying the expected format.
      // We don't restrict input (admins may also type "February 2023") — the
      // prompt just shows when the cell is selected.
      if (releasedColLetter) {
        ws.getCell(`${releasedColLetter}${i}`).dataValidation = {
          type: "textLength",
          operator: "greaterThanOrEqual",
          formulae: [0],
          allowBlank: true,
          showInputMessage: true,
          promptTitle: "Release date",
          prompt:
            "Use dd/mm/yyyy (e.g. 15/02/2023). Freeform text like \"February 2023\" is also accepted.",
        };
      }
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=plusway_models_bulk_template.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating model template:", error);
    res.status(500).json({ message: "Failed to generate Excel template", error: error.message });
  }
};
