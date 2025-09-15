import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup2.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Signup2() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const email = sessionStorage.getItem("signupEmail");

  useEffect(() => {
    if (!email) navigate ("/signup1");
  }, [email, navigate]);

  const handleCodeChange = (index, value) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 4) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev && prev.focus();
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  const onConfirm = async (e) => {
    e.preventDefault();
    if (!isCodeComplete) return;
    try {
      setLoading(true);
      const fullCode = code.join("");
      const res = await fetch(`${API}/auth/signup/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid or expired code");

      sessionStorage.setItem("signupToken", data.signupToken);
      navigate("/signup3");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    try {
      const res = await fetch(`${API}/auth/signup/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code");
      alert("A new code has been sent to your email.");
      setCode(["", "", "", "", ""]);
      const first = document.getElementById("code-0");
      first && first.focus();
    } catch (err) {
      alert(err.message);
    }
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
              disabled={!isCodeComplete || loading}
            >
              {loading ? "verifying..." : "confirm"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Signup2;
