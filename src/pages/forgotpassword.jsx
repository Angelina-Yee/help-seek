import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/forgotpassword.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const cleaned = email.trim().toLowerCase();
  const isUCSDEmail = cleaned.endsWith("@ucsd.edu");

  const onSendReset = async (e) => {
    e.preventDefault();
    if (!isUCSDEmail) {
      alert("Please enter your UCSD email");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/forgot-password/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleaned }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset code");

      sessionStorage.setItem("forgotEmail", cleaned);
      navigate("/forgotpassword2");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <Link to="/instructions">how it works</Link>
        </nav>
      </header>

      <div className="forgot-container">
        <section className="forgot-box">
          <div className="forgot-header">
            <h2>forgot password</h2>
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
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="send-reset-btn"
              disabled={!isUCSDEmail || loading}
            >
              {loading ? "sending..." : "send"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;
