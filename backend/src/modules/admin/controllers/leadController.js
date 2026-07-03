import Lead from '../../../models/Lead.js';
import asyncHandler from '../../../middleware/asyncHandler.js';

const escapeRegex = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all leads
// @route   GET /api/admin/leads
// @access  Private/Admin
export const getLeads = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.pageNumber) || 1;
  const search = req.query.search || '';
  const status = req.query.status || '';

  let filter = {};

  if (search) {
    const escapedSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { phone: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
      { city: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  if (status && status !== 'All') {
    filter.status = status;
  }

  const count = await Lead.countDocuments(filter);
  const leads = await Lead.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    leads,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Update lead status
// @route   PUT /api/admin/leads/:id
// @access  Private/Admin
export const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  if (status) {
    const validStatuses = ['New', 'Contacted', 'Closed'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }
    lead.status = status;
  }

  const updatedLead = await lead.save();
  res.json(updatedLead);
});

// @desc    Delete a lead
// @route   DELETE /api/admin/leads/:id
// @access  Private/Admin
export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  await lead.deleteOne();
  res.json({ message: 'Lead removed' });
});
