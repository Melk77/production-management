import { useState } from "react";
import { authApi } from "../../services/api";
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
      const data = await authApi.resetPassword(token, password);

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
