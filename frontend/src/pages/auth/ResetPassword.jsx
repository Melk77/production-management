import { useState } from "react";
import "./ResetPassword.css";

function ResetPassword() {
  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage(data.message);

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h1>Reset Password</h1>

        <p>Enter your new password below.</p>

        {message && <div className="success-message">{message}</div>}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>New Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            minLength="6"
            required
          />

          <label>Confirm Password</label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            minLength="6"
            required
          />

          <button type="submit">Reset Password</button>
        </form>

        <a href="/login">Back to Login</a>
      </div>
    </div>
  );
}

export default ResetPassword;
