import axios from "axios";
import Otp from "../models/Otp.js";

// ==========================================
// Helpers & Configuration
// ==========================================

/**
 * Generate numeric OTP
 */
const generateOTP = (length = 4) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Normalize mobile number to include country code (91)
 */
const normalizeMobileNumber = (mobile) => {
  let cleanMobile = mobile.replace(/^\+/, "").replace(/\D/g, "");

  if (!cleanMobile.startsWith("91")) {
    cleanMobile = "91" + cleanMobile;
  }

  if (cleanMobile.length < 12 || cleanMobile.length > 13) {
    throw new Error(
      `Invalid mobile number: ${cleanMobile}. Must be 12-13 digits with country code.`,
    );
  }

  return cleanMobile;
};

/**
 * Build DLT-compliant message
 */
const buildOtpMessage = (otp) => {
  const appName = process.env.APP_NAME || "PlusWay";
  // NOTE: This template must match EXACTLY with your DLT approved template.
  // If your template is "Your OTP is {#var#}. Valid for 5 minutes.", use that format instead.
  // The reference code uses: "Welcome to the ${appName} powered by SMSINDIAHUB. Your OTP for registration is ${otp}"
  // I will use the reference format as requested, but user should verify DLT.
  return `Welcome to the ${appName} powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;
};

/**
 * Check if special bypass should be used
 * Currently enabled for a small set of known test numbers.
 */
const isSpecialBypass = (mobile) => {
  const normalized = mobile.replace(/\D/g, "");
  const specialMobiles = ["9111966732", "6268423925"];
  return specialMobiles.includes(normalized);
};

/**
 * Check if mock mode should be used
 */
const isMockMode = () => {
  const SMS_INDIA_HUB_API_KEY = process.env.SMS_INDIA_HUB_API_KEY;
  const SMS_INDIA_HUB_SENDER_ID = process.env.SMS_INDIA_HUB_SENDER_ID;
  return (
    process.env.USE_MOCK_OTP === "true" ||
    !SMS_INDIA_HUB_API_KEY ||
    !SMS_INDIA_HUB_SENDER_ID
  );
};

/**
 * Check if developer bypass OTP
 */
const isDeveloperBypass = (otp) => {
  return (
    (process.env.NODE_ENV !== "production" ||
      process.env.USE_MOCK_OTP === "true") &&
    otp === "999999"
  );
};

/**
 * Parse and handle SMS India HUB API response
 */
const handleSmsResponse = (responseData) => {
  const errorCode = responseData.ErrorCode || "";
  const errorMsg = responseData.ErrorMessage || "";

  // Success indicators
  if (
    errorCode === "000" ||
    errorMsg === "Done" ||
    responseData.JobId ||
    responseData.MessageData
  ) {
    return; // Success
  }

  // Error handling
  if (errorCode || errorMsg) {
    switch (errorCode) {
      case "001":
        throw new Error("SMS India HUB: Account details cannot be blank.");
      case "006":
        throw new Error(
          "SMS India HUB: Invalid DLT template. Message does not match registered template.",
        );
      case "007":
        throw new Error("SMS India HUB: Invalid API key or credentials.");
      case "021":
        throw new Error("SMS India HUB: Insufficient credits in your account.");
      default:
        throw new Error(
          `SMS India HUB API Error (Code: ${errorCode}): ${errorMsg}`,
        );
    }
  }
};

/**
 * Send SMS via SMS India HUB API
 */
const sendSmsViaApi = async (mobile, message) => {
  const SMS_INDIA_HUB_API_KEY = process.env.SMS_INDIA_HUB_API_KEY;
  const SMS_INDIA_HUB_SENDER_ID = process.env.SMS_INDIA_HUB_SENDER_ID;
  const SMS_INDIA_HUB_DLT_TEMPLATE_ID =
    process.env.SMS_INDIA_HUB_DLT_TEMPLATE_ID;
  const SMS_INDIA_HUB_API_URL =
    process.env.SMS_INDIA_HUB_URL ||
    "http://cloud.smsindiahub.in/vendorsms/pushsms.aspx";
  const API_TIMEOUT = 30000; // 30 seconds

  if (!SMS_INDIA_HUB_API_KEY || !SMS_INDIA_HUB_SENDER_ID) {
    throw new Error(
      "SMS India HUB credentials are missing. Please check environment variables.",
    );
  }

  const cleanMobile = normalizeMobileNumber(mobile);

  const params = {
    APIKey: SMS_INDIA_HUB_API_KEY.trim(),
    msisdn: cleanMobile,
    sid: SMS_INDIA_HUB_SENDER_ID.trim(),
    msg: message,
    fl: "0",
    gwid: "2",
  };

  if (SMS_INDIA_HUB_DLT_TEMPLATE_ID?.trim()) {
    params.DLT_TE_ID = SMS_INDIA_HUB_DLT_TEMPLATE_ID.trim();
  }

  console.log(
    "[SMS] Sending to:",
    cleanMobile,
    "Params:",
    JSON.stringify(params),
  );

  const response = await axios.get(SMS_INDIA_HUB_API_URL, {
    params,
    timeout: API_TIMEOUT,
  });

  console.log("[SMS] Response:", response.data);

  // Handle case where response data is string (sometimes happens with providers)
  let responseData = response.data;
  if (typeof responseData === "string") {
    try {
      responseData = JSON.parse(responseData);
    } catch (e) {
      // Manual check if not JSON
      if (responseData.includes("ErrorCode=000")) {
        // treat as success object
        responseData = { ErrorCode: "000" };
      }
    }
  }

  handleSmsResponse(responseData);
};

/**
 * Save OTP to database
 */
const saveOtpToDb = async (mobile, otp, userType) => {
  // Normalize mobile number (remove any non-digits, ensure consistent format)
  const normalizedMobile = mobile.replace(/\D/g, "");

  await Otp.deleteMany({ mobile: normalizedMobile, userType });
  await Otp.create({
    mobile: normalizedMobile,
    otp: otp.trim(),
    userType,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
  });
};

/**
 * Verify OTP from database
 */
const verifyOtpFromDb = async (mobile, otp, userType) => {
  // Normalize mobile number (remove any non-digits, ensure consistent format)
  const normalizedMobile = mobile.replace(/\D/g, "");

  const record = await Otp.findOne({
    mobile: normalizedMobile,
    userType,
    otp: otp.trim(),
  });

  if (!record) {
    console.error("OTP verification failed - record not found:", {
      mobile: normalizedMobile,
      userType,
      otp: otp.trim(),
    });
    return false;
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    console.error("OTP verification failed - expired:", {
      mobile: normalizedMobile,
      expiresAt: record.expiresAt,
      now: new Date(),
    });
    return false;
  }

  await Otp.deleteOne({ _id: record._id });
  return true;
};

// ==========================================
// Exported Functions
// ==========================================

export const sendSmsOtp = async (mobile, userType = "Delivery") => {
  try {
    const otp = generateOTP(4);

    // Special number bypass
    if (isSpecialBypass(mobile)) {
      const specialOtp = "1234";
      await saveOtpToDb(mobile, specialOtp, userType);
      return {
        success: true,
        sessionId: "DB_VERIFIED_" + mobile,
        message: "OTP sent successfully",
      };
    }

    // Mock mode
    if (isMockMode()) {
      await saveOtpToDb(mobile, otp, userType);
      console.log(`[MOCK] OTP for ${mobile}: ${otp}`);
      return {
        success: true,
        sessionId: "MOCK_SESSION_" + mobile,
        message: "OTP sent successfully",
      };
    }

    // Real mode - Send via SMS India HUB
    await saveOtpToDb(mobile, otp, userType);
    const message = buildOtpMessage(otp);
    await sendSmsViaApi(mobile, message);

    return {
      success: true,
      sessionId: "DB_VERIFIED_" + mobile,
      message: "OTP sent successfully",
    };
  } catch (error) {
    const errorMessage =
      error.message || "Failed to send OTP. Please try again.";
    console.error("SMS OTP Error (sendSmsOtp):", {
      error: errorMessage,
      mobile,
      userType,
    });
    throw new Error(errorMessage);
  }
};

export const verifySmsOtp = async (
  sessionId,
  otpInput,
  mobile,
  userType = "Delivery",
) => {
  if (isDeveloperBypass(otpInput)) {
    return true;
  }

  // Normalize OTP input (remove spaces, ensure it's a string)
  const normalizedOtp = String(otpInput).trim().replace(/\s/g, "");

  if (!normalizedOtp || normalizedOtp.length !== 4) {
    console.error("OTP verification failed - invalid OTP format:", {
      otpInput,
      normalizedOtp,
      length: normalizedOtp.length,
    });
    return false;
  }

  let targetMobile = mobile;
  if (!targetMobile && sessionId) {
    if (sessionId.startsWith("DB_VERIFIED_")) {
      targetMobile = sessionId.replace("DB_VERIFIED_", "");
    } else if (sessionId.startsWith("MOCK_SESSION_")) {
      targetMobile = sessionId.replace("MOCK_SESSION_", "");
    }
  }

  if (!targetMobile) {
    console.error("OTP verification failed - no mobile number:", {
      sessionId,
      mobile,
      userType,
    });
    return false;
  }

  // Normalize mobile number
  const normalizedMobile = targetMobile.replace(/\D/g, "");

  if (normalizedMobile.length !== 10) {
    console.error("OTP verification failed - invalid mobile format:", {
      original: targetMobile,
      normalized: normalizedMobile,
      length: normalizedMobile.length,
    });
    return false;
  }

  return verifyOtpFromDb(normalizedMobile, normalizedOtp, userType);
};

export const sendOTP = async (mobile, userType, _isLogin = true) => {
  try {
    const otp = generateOTP(4);

    // Special number bypass
    if (isSpecialBypass(mobile)) {
      const specialOtp = "1234";
      await saveOtpToDb(mobile, specialOtp, userType);
      return {
        success: true,
        message: "OTP sent successfully",
      };
    }

    // Mock mode
    if (isMockMode()) {
      await saveOtpToDb(mobile, otp, userType);
      console.log(`[MOCK] OTP for ${mobile}: ${otp}`);
      return {
        success: true,
        message: "OTP sent successfully",
      };
    }

    // Real mode - Send via SMS India HUB
    await saveOtpToDb(mobile, otp, userType);
    const message = buildOtpMessage(otp);
    await sendSmsViaApi(mobile, message);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    const errorMessage =
      error.message || "Failed to send OTP. Please try again.";
    console.error("SMS OTP Error (sendOTP):", {
      error: errorMessage,
      mobile,
      userType,
    });
    throw new Error(errorMessage);
  }
};

export const verifyOTP = async (mobile, otpInput, userType) => {
  if (isDeveloperBypass(otpInput)) {
    return true;
  }

  // Normalize OTP input (remove spaces, ensure it's a string)
  const normalizedOtp = String(otpInput).trim().replace(/\s/g, "");

  if (!normalizedOtp || normalizedOtp.length !== 4) {
    console.error("OTP verification failed - invalid OTP format:", {
      otpInput,
      normalizedOtp,
      length: normalizedOtp.length,
    });
    return false;
  }

  // Normalize mobile number
  const normalizedMobile = mobile.replace(/\D/g, "");

  if (normalizedMobile.length !== 10) {
    console.error("OTP verification failed - invalid mobile format:", {
      original: mobile,
      normalized: normalizedMobile,
      length: normalizedMobile.length,
    });
    return false;
  }

  return verifyOtpFromDb(normalizedMobile, normalizedOtp, userType);
};
