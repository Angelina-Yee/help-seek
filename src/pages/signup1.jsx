import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Signup1() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if email ends with @ucsd.edu
  const isUCSDEmail = email.trim().toLowerCase().endsWith("@ucsd.edu");

  const onSend = async (e) => {
    e.preventDefault();
    if (!isUCSDEmail) {
      alert("Please enter a valid UCSD email");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/signup/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send code");

      sessionStorage.setItem("signupEmail", email.trim().toLowerCase());
    navigate("/signup2");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su1">
      {/*Navbar*/}
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <Link to="/instructions">how it works</Link>
        </nav>
      </header>
      {/*Hero*/}
      <div className="signup-container">
        <section className="signup-box">
          <div className="signup-header">
            <h2>sign up</h2>
            <span className="step">1/3</span>
          </div>
          <p className="login-text">
            already have an account? <a href="#">login</a>
          </p>

          <form className="signup-form1" onSubmit={onSend}>
            <label htmlFor="email">email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="send-btn" disabled = {loading}>
              {loading ? "sending..." : "verify"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Signup1;
