import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup.css";

function Signup1() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // Check if email ends with @ucsd.edu
  const isUCSDEmail = email.trim().toLowerCase().endsWith("@ucsd.edu");

  const onSend = (e) => {
    e.preventDefault();
    if (!isUCSDEmail) {
      alert("Please enter a valid UCSD email");
      return;
    }
    navigate("/signup2");
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
      <div className="signup-container1">
        <section className="signup-box1">
          <div className="signup-header1">
            <h2>sign up</h2>
            <span className="step1">1/3</span>
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
            <button type="submit" className="send-btn">
              verify
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Signup1;
