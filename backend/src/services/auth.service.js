const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const login = async (email, password) => {
  const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (users.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = users[0];

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return {
    user: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

// =========================================================
// FORGOT PASSWORD
// =========================================================

const forgotPassword = async (email) => {
  const [users] = await pool.query(
    "SELECT user_id, email FROM users WHERE email = ?",
    [email],
  );

  /*
   * Don't reveal whether an email exists.
   * This prevents email/account enumeration.
   */
  if (users.length === 0) {
    return;
  }

  const user = users[0];

  // Delete any previous reset tokens
  await pool.query("DELETE FROM password_reset_tokens WHERE user_id = ?", [
    user.user_id,
  ]);

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token before storing it
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token expires in 30 minutes
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await pool.query(
    `INSERT INTO password_reset_tokens
        (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)`,
    [user.user_id, tokenHash, expiresAt],
  );

  // Frontend reset page
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"FactoryFlow" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "FactoryFlow Password Reset",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #1255b8;">
                    FactoryFlow Password Reset
                </h2>

                <p>
                    We received a request to reset your password.
                </p>

                <p>
                    Click the button below to create a new password.
                </p>

                <a
                    href="${resetLink}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        background: #1255b8;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                    "
                >
                    Reset Password
                </a>

                <p style="margin-top: 20px;">
                    This link will expire in 30 minutes.
                </p>

                <p>
                    If you did not request a password reset, you can ignore
                    this email.
                </p>
            </div>
        `,
  });
};

// =========================================================
// RESET PASSWORD
// =========================================================

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new Error("Token and new password are required");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Hash the token received from the frontend
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const [tokens] = await pool.query(
    `SELECT *
         FROM password_reset_tokens
         WHERE token_hash = ?
         AND expires_at > NOW()`,
    [tokenHash],
  );

  if (tokens.length === 0) {
    throw new Error("Invalid or expired password reset link");
  }

  const resetToken = tokens[0];

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await pool.query(
    `UPDATE users
         SET password_hash = ?
         WHERE user_id = ?`,
    [passwordHash, resetToken.user_id],
  );

  // Delete token so it cannot be reused
  await pool.query("DELETE FROM password_reset_tokens WHERE id = ?", [
    resetToken.id,
  ]);
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
