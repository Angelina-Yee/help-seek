import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";
import { setAccessToken } from "../api";

//API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Login Page
function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrMsg("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form validation
  const isFormValid =
    formData.email.trim() !== "" && formData.password.trim() !== "";

  // login submission
  const onLogin = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    try {
      setLoading(true);
      setErrMsg("");

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setErrMsg("Your password is incorrect or this account does not exist.");
        } else if (res.status === 403) {
          setErrMsg("Please verify your email before logging in.");
        } else {
          setErrMsg(data.message || "Login failed. Please try again.");
        }
        return;
      }

      if (!data.accessToken) {
        setErrMsg("No access token returned. Please try again.");
        return;
      }

      // Save token and user info
      setAccessToken(data.accessToken);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");

      navigate("/profile", { replace: true });
    } catch (err) {
      setErrMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to forgot password page
  const onForgotPassword = () => navigate("/forgot-password");

  // HTML
  return (
    <div className="login-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <Link to="/instructions">how it works</Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="login-container">
        <section className="login-box">
          <div className="login-header">
            <h2>login</h2>
            <p className="login-text">
              don't have an account? <Link to="/signup1">signup</Link>
            </p>
          </div>

          <form className="login-form" onSubmit={onLogin}>
            <label htmlFor="email">email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
            />

            <label htmlFor="password">password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.42-.08.65 0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="button"
              className="forgot-btn"
              onClick={onForgotPassword}
            >
              forgot password?
            </button>

            {errMsg && <div className="error-message" role="alert">{errMsg}</div>}

            <button type="submit" className="login-btn" disabled={!isFormValid || loading}>
              {loading ? "signing in..." : "confirm"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Login;