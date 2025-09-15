import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Basic validation
  const isFormValid =
    formData.email.trim() !== "" && formData.password.trim() !== "";

  const onLogin = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      alert("Please fill in all fields");
      return;
    }

    // Add login logic here
    console.log("Login attempt:", formData);
    navigate("/dashboard"); // or wherever you want to go after login
  };

  const onForgotPassword = () => {
    // Add forgot password logic here
    console.log("Forgot password clicked");
    // navigate("/forgot-password");
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
            <h2>log in</h2>
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
              login
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Login;
