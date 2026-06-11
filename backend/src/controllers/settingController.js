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

  // Update product sidebar settings if provided
  if (req.body.productSidebar) {
    if (req.body.productSidebar.needHelp) {
      settings.productSidebar.needHelp.title = req.body.productSidebar.needHelp.title || settings.productSidebar.needHelp.title;
      settings.productSidebar.needHelp.description = req.body.productSidebar.needHelp.description || settings.productSidebar.needHelp.description;
    }
    if (req.body.productSidebar.freeShipping) {
      settings.productSidebar.freeShipping.title = req.body.productSidebar.freeShipping.title || settings.productSidebar.freeShipping.title;
      settings.productSidebar.freeShipping.description = req.body.productSidebar.freeShipping.description || settings.productSidebar.freeShipping.description;
    }
    if (req.body.productSidebar.guarantee) {
      settings.productSidebar.guarantee.title = req.body.productSidebar.guarantee.title || settings.productSidebar.guarantee.title;
      settings.productSidebar.guarantee.description = req.body.productSidebar.guarantee.description || settings.productSidebar.guarantee.description;
    }
    if (req.body.productSidebar.paymentProtection) {
      settings.productSidebar.paymentProtection.title = req.body.productSidebar.paymentProtection.title || settings.productSidebar.paymentProtection.title;
      settings.productSidebar.paymentProtection.description = req.body.productSidebar.paymentProtection.description || settings.productSidebar.paymentProtection.description;
    }
  }

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});
