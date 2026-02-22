import Customer from "../../../models/Customer.js";
import generateToken from "../../../utils/generateToken.js";
import { verifySmsOtp } from "../../../services/otpService.js";

// @desc    Register a new customer
// @route   POST /api/customer/register
// @access  Public
export const registerCustomer = async (req, res) => {
  const { name, mobile, email, otp } = req.body;

  const isValidOtp = await verifySmsOtp(null, otp, mobile, "Customer");
  if (!isValidOtp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const customerExists = await Customer.findOne({ mobile });

  if (customerExists) {
    return res.status(400).json({ message: "Customer already exists" });
  }

  const customer = await Customer.create({
    name,
    mobile,
    email,
  });

  if (customer) {
    res.status(201).json({
      _id: customer._id,
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      token: generateToken(customer._id, "customer"),
    });
  } else {
    res.status(400).json({ message: "Invalid customer data" });
  }
};

// @desc    Auth customer & get token (Login via mobile - simplified for now)
// @route   POST /api/customer/login
// @access  Public
export const authCustomer = async (req, res) => {
  const { mobile, otp } = req.body;

  const isValidOtp = await verifySmsOtp(null, otp, mobile, "Customer");
  if (!isValidOtp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const customer = await Customer.findOne({ mobile });

  if (customer) {
    res.json({
      _id: customer._id,
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      token: generateToken(customer._id, "customer"),
    });
  } else {
    res.status(401).json({ message: "Invalid mobile number" });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customer/profile
// @access  Private
export const updateCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);

    if (customer) {
      customer.name = req.body.name || customer.name;
      customer.email = req.body.email || customer.email;
      // Mobile cannot be changed as it's the primary identifier

      const updatedCustomer = await customer.save();

      res.json({
        _id: updatedCustomer._id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        mobile: updatedCustomer.mobile,
        token: generateToken(updatedCustomer._id, "customer"),
      });
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
