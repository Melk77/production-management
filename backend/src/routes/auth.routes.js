const express = require("express");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validateLogin } = require("../middleware/validate");

// Limit login to 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit password reset emails to 5 requests per hour per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Too many password reset requests. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login
router.post("/login", loginLimiter, validateLogin, authController.login);

// Forgot password
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);

// Reset password
router.post("/reset-password", authController.resetPassword);

module.exports = router;


