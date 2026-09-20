import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import factoryImage from "../../assets/factory.png";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ================= LEFT SIDE ================= */}
      <div className="login-side login-side-left">
        <h2>PLAN. PRODUCE. PERFORM.</h2>

        <p>
          Streamline your production workflow and keep every process moving.
        </p>

        <div className="side-line"></div>

        <span>PRODUCTION MANAGEMENT</span>
      </div>

      {/* ================= LOGIN CARD ================= */}
      <div className="login-card">
        {/* Factory Image */}
        <div className="factory-image">
          <img src={factoryImage} alt="Factory" />
        </div>

        {/* Login Content */}
        <div className="login-content">
          {/* Brand */}
          <div className="brand">
            <div className="brand-logo">⚙</div>

            <div>
              <h1>FactoryFlow</h1>
              <p>Production Management System</p>
            </div>
          </div>

          {/* Welcome */}
          <div className="welcome">
            <h2>Welcome Back!</h2>
            <p>Sign in to continue</p>
          </div>

          {/* Error */}
          {error && <p className="login-error">{error}</p>}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@factoryflow.com"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="forgot-password">
              <Link to="/password-reset">Forgot Password?</Link>
            </div>

            {/* Sign In */}
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            © 2026 FactoryFlow. All rights reserved.
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="login-side login-side-right">
        <h2>
          BUILT FOR THE
          <br />
          FACTORY FLOOR.
        </h2>

        <p>
          Manage production, machines, inventory, and quality from one place.
        </p>

        <div className="side-line"></div>

        <span>SMART. CONNECTED. EFFICIENT.</span>
      </div>
    </div>
  );
}

export default Login;
