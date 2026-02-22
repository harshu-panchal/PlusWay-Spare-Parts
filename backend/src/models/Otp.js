import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v); // Validate 10-digit format
        },
        message: "Mobile number must be 10 digits",
      },
    },
    otp: { type: String, required: true, trim: true },
    userType: {
      type: String,
      required: true,
      enum: ["Admin", "Seller", "Customer", "Delivery"],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete after expiry
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Compound index for faster lookups
otpSchema.index({ mobile: 1, userType: 1 });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
