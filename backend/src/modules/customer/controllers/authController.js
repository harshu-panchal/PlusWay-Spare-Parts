import asyncHandler from '../../../middleware/asyncHandler.js';
import { sendSmsOtp } from '../../../services/otpService.js';
import Customer from '../../../models/Customer.js';

// @desc    Send OTP for registration/login
// @route   POST /api/customer/send-otp
// @access  Public
export const sendOtp = asyncHandler(async (req, res) => {
  const { mobile, type } = req.body; // type: 'register' or 'login'

  if (!mobile) {
    res.status(400);
    throw new Error('Mobile number is required');
  }

  // Validate mobile format
  if (!/^[0-9]{10}$/.test(mobile)) {
    res.status(400);
    throw new Error('Mobile number must be 10 digits');
  }

  // Check if customer exists based on type
  const customerExists = await Customer.findOne({ mobile });

  if (type === 'register' && customerExists) {
    res.status(400);
    throw new Error('Customer already exists');
  }

  if (type === 'login' && !customerExists) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // Send OTP
  const result = await sendSmsOtp(mobile, 'Customer');
  
  res.status(200).json(result);
});
