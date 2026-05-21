import Category from '../../../models/Category.js';
import asyncHandler from '../../../middleware/asyncHandler.js';

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
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
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
  const { name, slug, image, isAccessory } = req.body;

  const categoryExists = await Category.findOne({ slug });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category with this slug already exists');
  }

  const category = new Category({
    name,
    slug,
    image,
    isAccessory,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, image, isAccessory } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.image = image || category.image;
    category.isAccessory = isAccessory !== undefined ? isAccessory : category.isAccessory;

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
