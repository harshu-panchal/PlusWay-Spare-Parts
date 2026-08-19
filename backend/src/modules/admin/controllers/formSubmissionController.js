import FormSubmission from '../../../models/FormSubmission.js';
import asyncHandler from '../../../middleware/asyncHandler.js';

// @desc    Get all form submissions (optionally filtered by formType/status)
// @route   GET /api/admin/form-submissions
// @access  Private/Admin
export const getFormSubmissions = asyncHandler(async (req, res) => {
  const { formType, status } = req.query;
  const filter = {};
  if (formType && formType !== 'All') filter.formType = formType;
  if (status && status !== 'All') filter.status = status;

  const submissions = await FormSubmission.find(filter)
    .populate('user', 'name email mobile')
    .sort({ createdAt: -1 });
  res.json(submissions);
});

// @desc    Update a form submission's status / admin reply
// @route   PUT /api/admin/form-submissions/:id
// @access  Private/Admin
export const updateFormSubmission = asyncHandler(async (req, res) => {
  const submission = await FormSubmission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  if (req.body.status) submission.status = req.body.status;
  if (req.body.priority) submission.priority = req.body.priority;
  if (req.body.adminReply !== undefined) submission.adminReply = req.body.adminReply;

  const updated = await submission.save();
  res.json(updated);
});

// @desc    Delete a form submission
// @route   DELETE /api/admin/form-submissions/:id
// @access  Private/Admin
export const deleteFormSubmission = asyncHandler(async (req, res) => {
  const submission = await FormSubmission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  await FormSubmission.deleteOne({ _id: submission._id });
  res.json({ message: 'Submission removed' });
});
