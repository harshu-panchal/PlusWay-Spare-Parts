import asyncHandler from '../../../middleware/asyncHandler.js';
import { sendSmsOtp, verifySmsOtp } from '../../../services/otpService.js';
import Customer from '../../../models/Customer.js';
import generateToken from '../../../utils/generateToken.js';

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

// @desc    Verify OTP
// @route   POST /api/customer/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    res.status(400);
    throw new Error('Mobile number and OTP are required');
  }

  const isValidOtp = await verifySmsOtp(null, otp, mobile, 'Customer', false);

  if (isValidOtp) {
    const customer = await Customer.findOne({ mobile });

    if (customer) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token: generateToken(customer._id, 'customer'),
          user: {
            id: customer._id,
            name: customer.name,
            phone: customer.mobile,
            email: customer.email || "",
            walletAmount: 0,
            refCode: "",
            status: customer.status || "Active"
          }
        }
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: null,
        needsRegistration: true
      });
    }
  } else {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }
});
