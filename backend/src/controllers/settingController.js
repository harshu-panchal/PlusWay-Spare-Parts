import asyncHandler from "../middleware/asyncHandler.js";
import Setting from "../models/Setting.js";

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  res.json(settings);
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting();
  }

  const SECTIONS = ["general", "contact", "social", "shipping", "payments", "seo"];

  // For each top-level section, merge field-by-field so omitted fields are left unchanged.
  SECTIONS.forEach((section) => {
    const incoming = req.body[section];
    if (incoming && typeof incoming === "object") {
      Object.keys(incoming).forEach((field) => {
        const val = incoming[field];
        // Allow explicit false / 0 / "" so the admin can clear a field intentionally.
        if (val !== undefined && val !== null) {
          settings[section][field] = val;
        }
      });
    }
  });

  // productSidebar has a nested structure — merge one extra level deep.
  const sidebar = req.body.productSidebar;
  if (sidebar && typeof sidebar === "object") {
    ["needHelp", "freeShipping", "guarantee", "paymentProtection"].forEach((key) => {
      if (sidebar[key] && typeof sidebar[key] === "object") {
        if (sidebar[key].title !== undefined)       settings.productSidebar[key].title       = sidebar[key].title;
        if (sidebar[key].description !== undefined) settings.productSidebar[key].description = sidebar[key].description;
      }
    });
  }

  const updated = await settings.save();
  res.json(updated);
});
