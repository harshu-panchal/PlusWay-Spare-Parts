import Lead from '../../../models/Lead.js';
import asyncHandler from '../../../middleware/asyncHandler.js';

// @desc    Create a new lead (public)
// @route   POST /api/customer/leads
// @access  Public
export const createLead = asyncHandler(async (req, res) => {
  const { name, phone, email, area, city, pincode, state, country, message } =
    req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }

  if (!phone?.trim()) {
    res.status(400);
    throw new Error('Phone number is required');
  }

  const lead = new Lead({
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || '',
    area: area?.trim() || '',
    city: city?.trim() || '',
    pincode: pincode?.trim() || '',
    state: state?.trim() || '',
    country: country?.trim() || '',
    message: message?.trim() || '',
  });

  const createdLead = await lead.save();
  res.status(201).json(createdLead);
});
