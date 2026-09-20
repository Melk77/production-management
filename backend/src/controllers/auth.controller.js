const authService = require("../services/auth.service");

// =========================================================
// LOGIN
// =========================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await authService.login(email, password);

    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

// =========================================================
// FORGOT PASSWORD
// =========================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    await authService.forgotPassword(email);

    /*
     * Always return the same message.
     * Don't tell the user whether the email exists.
     */
    res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};

// =========================================================
// RESET PASSWORD
// =========================================================

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
