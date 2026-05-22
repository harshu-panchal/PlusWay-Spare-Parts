import Model from "../../../models/Model.js";
import Brand from "../../../models/Brand.js";

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
