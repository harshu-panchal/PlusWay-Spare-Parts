import Category from '../../../models/Category.js';
import asyncHandler from '../../../middleware/asyncHandler.js';

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getCategories = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.pageNumber) || 1;
  const search = req.query.search || '';

  if (req.query.all === 'true') {
    const categories = await Category.find({}).sort({ name: 1 });
    return res.json({ categories, total: categories.length });
  }

  let filter = {};
  if (search) {
    const escapedSearch = escapeRegex(search);

    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { slug: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const count = await Category.countDocuments(filter);
  const categories = await Category.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ categories, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, image, isAccessory, showInMobileSpareParts } = req.body;

  const categoryExists = await Category.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${name}$`, "i") } },
      { slug: { $regex: new RegExp(`^${slug}$`, "i") } }
    ]
  });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category with this name or slug already exists');
  }

  const category = new Category({
    name,
    slug,
    image,
    isAccessory,
    showInMobileSpareParts,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, image, isAccessory, showInMobileSpareParts } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    const newName = name || category.name;
    const newSlug = slug || category.slug;

    const categoryExists = await Category.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { name: { $regex: new RegExp(`^${newName}$`, "i") } },
        { slug: { $regex: new RegExp(`^${newSlug}$`, "i") } }
      ]
    });

    if (categoryExists) {
      res.status(400);
      throw new Error('Category with this name or slug already exists');
    }

    category.name = newName;
    category.slug = newSlug;
    category.image = image || category.image;
    category.isAccessory = isAccessory !== undefined ? isAccessory : category.isAccessory;
    category.showInMobileSpareParts = showInMobileSpareParts !== undefined ? showInMobileSpareParts : category.showInMobileSpareParts;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});
