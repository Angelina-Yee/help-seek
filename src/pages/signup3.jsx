import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup3.css";

function Signup3() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validation checks
  const isFirstNameValid = formData.firstName.length >= 1;
  const isLastNameValid = formData.lastName.length >= 1;
  const isPasswordValid =
    formData.newPassword.length >= 8 &&
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
      formData.newPassword
    );
  const isPasswordMatching =
    formData.newPassword === formData.confirmPassword &&
    formData.confirmPassword !== "";

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isPasswordValid &&
    isPasswordMatching;

  const onSignup = (e) => {
    e.preventDefault();

    if (!isFirstNameValid) {
      alert("First name must be at least 1 characters long");
      return;
    }
    if (!isLastNameValid) {
      alert("Last name must be at least 1 characters long");
      return;
    }
    if (!isPasswordValid) {
      alert(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
      return;
    }
    if (!isPasswordMatching) {
      alert("Passwords do not match");
      return;
    }

    // Navigate to next page or complete signup
    navigate("/dashboard"); // or wherever you want to go after signup
  };

  return (
    <div className="su3">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <Link to="/instructions">how it works</Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="signup-container">
        <section className="signup-box">
          <div className="signup-header">
            <h2>sign up</h2>
            <span className="step">3/3</span>
          </div>

          <form className="signup-form" onSubmit={onSignup}>
            <div className="name-row">
              <div className="name-field">
                <label htmlFor="firstName">first name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  minLength="1"
                />
              </div>

              <div className="name-field">
                <label htmlFor="lastName">last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  minLength="1"
                />
              </div>
            </div>

            <label htmlFor="newPassword">new password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              minLength="8"
            />

            <label htmlFor="confirmPassword">confirm password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />

            <button
              type="submit"
              className="signup-btn"
              disabled={!isFormValid}
            >
              sign up
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Signup3;
