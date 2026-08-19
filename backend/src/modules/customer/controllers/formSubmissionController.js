import FormSubmission from '../../../models/FormSubmission.js';
import asyncHandler from '../../../middleware/asyncHandler.js';

const ALLOWED_FORM_TYPES = ['Contact', 'Support', 'Career', 'Replacement'];

// @desc    Create a form submission (Contact / Support / Career / Replacement)
// @route   POST /api/customer/form-submissions
// @access  Public
export const createFormSubmission = asyncHandler(async (req, res) => {
  const { formType, name, email, phone, subject, message, meta } = req.body;

  if (!ALLOWED_FORM_TYPES.includes(formType)) {
    res.status(400);
    throw new Error('Invalid form type');
  }
  if (!name?.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }
  if (!email?.trim()) {
    res.status(400);
    throw new Error('Email is required');
  }
  if (!message?.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  const submission = await FormSubmission.create({
    formType,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || '',
    subject: subject?.trim() || '',
    message: message.trim(),
    meta: meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {},
  });

  res.status(201).json({ message: 'Submitted successfully', id: submission._id });
});
