import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup2.css";

function Signup2() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", ""]);

  const handleCodeChange = (index, value) => {
    // Only allow single digits (0-9)
    if (/^[0-9]$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 4) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  const onConfirm = (e) => {
    e.preventDefault();
    if (isCodeComplete) {
      navigate("/signup3"); // or wherever you want to go next
    }
  };

  const onResendCode = () => {
    // Add resend code logic here
    console.log("Resending code...");
  };

  return (
    <div className="su2">
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
            <span className="step">2/3</span>
          </div>

          <form className="signup-form" onSubmit={onConfirm}>
            <div className="code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="code-input"
                />
              ))}
            </div>

            <button type="button" className="resend-btn" onClick={onResendCode}>
              resend code
            </button>

            <button
              type="submit"
              className="confirm-btn"
              disabled={!isCodeComplete}
            >
              confirm
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Signup2;
