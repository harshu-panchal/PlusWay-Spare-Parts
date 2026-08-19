import rateLimit from 'express-rate-limit';

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests per window
  message: {
    message: 'Too many OTP requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const formSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 form submissions per window
  message: {
    message: 'Too many submissions from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
