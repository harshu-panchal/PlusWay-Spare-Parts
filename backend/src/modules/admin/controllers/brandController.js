import Brand from '../../../models/Brand.js';
import asyncHandler from '../../../middleware/asyncHandler.js';

// @desc    Get all brands
// @route   GET /api/admin/brands
// @access  Private/Admin
export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({}); // Removed populate('models') for performance
  res.json(brands);
});

// @desc    Create a brand
// @route   POST /api/admin/brands
// @access  Private/Admin
export const createBrand = asyncHandler(async (req, res) => {
  const { name, logo } = req.body;

  const brandExists = await Brand.findOne({ name });

  if (brandExists) {
    res.status(400);
    throw new Error('Brand already exists');
  }

  const brand = new Brand({
    name,
    logo,
  });

  const createdBrand = await brand.save();
  res.status(201).json(createdBrand);
});

// @desc    Update a brand
// @route   PUT /api/admin/brands/:id
// @access  Private/Admin
export const updateBrand = asyncHandler(async (req, res) => {
  const { name, logo } = req.body;

  const brand = await Brand.findById(req.params.id);

  if (brand) {
    brand.name = name || brand.name;
    brand.logo = logo || brand.logo;

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

// @desc    Delete a brand
// @route   DELETE /api/admin/brands/:id
// @access  Private/Admin
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (brand) {
    await Brand.deleteOne({ _id: brand._id });
    res.json({ message: 'Brand removed' });
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});
