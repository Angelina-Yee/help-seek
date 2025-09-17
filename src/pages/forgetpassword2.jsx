import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup2.css"; // reuse the same styling

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function ForgetPassword2() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  // email saved from the "forgot password" step 1
  const email = sessionStorage.getItem("forgotEmail");

  // redirect back if no email is stored
  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  // type OTP inputs
  const handleCodeChange = (index, value) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 4) {
        const next = document.getElementById(`fp-code-${index + 1}`);
        next && next.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`fp-code-${index - 1}`);
      prev && prev.focus();
    }
  };

  const isCodeComplete = code.every((d) => d !== "");

  // verify code
  const onConfirm = async (e) => {
    e.preventDefault();
    if (!isCodeComplete) return;

    try {
      setLoading(true);
      const fullCode = code.join("");

      // TODO: confirm your endpoint path
      const res = await fetch(`${API}/auth/forgot-password/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid or expired code");

      // store reset token for the next step
      sessionStorage.setItem("resetToken", data.resetToken);

      // TODO: change route if your reset page path differs
      navigate("/forgotpassword3");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // resend code
  const onResendCode = async () => {
    try {
      // TODO: confirm your endpoint path
      const res = await fetch(`${API}/auth/forgot-password/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code");

      alert("A new code has been sent to your email.");
      setCode(["", "", "", "", ""]);
      const first = document.getElementById("fp-code-0");
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
      <div className="signup-container2">
        <section className="signup-box2">
          <div className="signup-header2">
            <h2>reset password</h2>
            <span className="step2">2/3</span>
          </div>
          <p className="auth-text">please enter the code sent to your email.</p>

          <form className="signup-form2" onSubmit={onConfirm}>
            <div className="code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`fp-code-${index}`}
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

export default ForgetPassword2;
