import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/forgotpassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // Check if email is valid UCSD email
  const isUCSDEmail = email.trim().toLowerCase().endsWith("@ucsd.edu");

  const onSendReset = (e) => {
    e.preventDefault();

    if (!isUCSDEmail) {
      alert("Please enter your UCSD email");
      return;
    }

    // Add forgot password logic here
    console.log("Sending reset email to:", email);
    alert("Password reset email sent! Check your inbox.");
    navigate("/login");
  };

  return (
    <div className="forgot-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <Link to="/instructions">how it works</Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="forgot-container">
        <section className="forgot-box">
          <div className="forgot-header">
            <h2>Forgot Password</h2>
          </div>

          <p className="forgot-text">
            enter your UCSD email. back to <Link to="/login">login</Link>
          </p>

          <form className="forgot-form" onSubmit={onSendReset}>
            <label htmlFor="email">email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              className="send-reset-btn"
              disabled={!isUCSDEmail}
            >
              send
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;
