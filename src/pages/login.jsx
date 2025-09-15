import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrMsg("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid =
    formData.email.trim() !== "" && formData.password.trim() !== "";

  const onLogin = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    try {
      setLoading(true);
      setErrMsg("");

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          alert("Your password is incorrect or this account does not exist.");
        } else if (res.status === 401) {
          alert("Your password is incorrect or this account does not exist.");
        } else if (res.status === 403) {
          alert("Please verify your email before logging in.");
        } else {
          alert(data.message || "Login failed. Please try again.");
        }
        return;
      }

      if (!data.accessToken) {
        alert("No access token returned. Please try again.");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("token", data.accessToken);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      localStorage.setItem("isAuthenticated", "true");

      navigate("/profile", { replace: true });
    } catch (err) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = () => {
    navigate("/forgot-password");
  };

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
              Don't have an account? <Link to="/signup1">signup</Link>
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
            />

            <label htmlFor="password">password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

            <button
              type="button"
              className="forgot-btn"
              onClick={onForgotPassword}
            >
              forgot password?
            </button>

            <button type="submit" className="login-btn" disabled={!isFormValid}>
              {loading ? "signing in..." : "confirm"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Login;