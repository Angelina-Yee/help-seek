import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/forgotpassword2.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";
const CODE_LEN = 5;

function ForgetPassword2() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("forgotEmail");
  const [code, setCode] = useState(Array(CODE_LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
      return;
    }
    inputsRef.current?.[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const isCodeComplete = useMemo(() => code.every((d) => d !== ""), [code]);

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < CODE_LEN - 1) {
      inputsRef.current?.[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current?.[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LEN);
    if (!text) return;
    const next = text
      .split("")
      .concat(Array(CODE_LEN).fill(""))
      .slice(0, CODE_LEN);
    setCode(next);
    const lastFilled = Math.min(text.length, CODE_LEN) - 1;
    inputsRef.current?.[lastFilled]?.focus();
  };

  // Confirm code
  const onConfirm = async (e) => {
    e.preventDefault();
    if (!isCodeComplete) return;

    try {
      setLoading(true);
      const fullCode = code.join("");
      const res = await fetch(`${API}/auth/forgot-password/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          alert("You entered the wrong code.");
          setCode(Array(CODE_LEN).fill(""));
          inputsRef.current?.[0]?.focus();
          return;
        }
        alert(data.message || "Invalid or expired code");
        return;
      }

      sessionStorage.setItem("resetToken", data.resetToken);
      navigate("/forgotpassword3");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (cooldown > 0) return;
    try {
      const res = await fetch(`${API}/auth/forgot-password/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code");

      alert("A new code has been sent to your email.");
      setCode(Array(CODE_LEN).fill(""));
      inputsRef.current?.[0]?.focus();
      setCooldown(30);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="su2">
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <Link to="/instructions">how it works</Link>
        </nav>
      </header>

      <div className="signup-container2">
        <section className="signup-box2">
          <div className="signup-header2">
            <h2>reset password</h2>
            <span className="step2">2/3</span>
          </div>
          <p className="auth-text">please enter the code sent to your email.</p>

          <form className="signup-form2" onSubmit={onConfirm}>
            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((d, i) => (
                <input
                  key={i}
                  id={`fp-code-${i}`}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  aria-label={`code digit ${i + 1}`}
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="code-input"
                />
              ))}
            </div>

            <button
              type="button"
              className="resend-btn"
              onClick={onResendCode}
              disabled={cooldown > 0}
              aria-disabled={cooldown > 0}
              title={
                cooldown > 0 ? `wait ${cooldown}s to resend` : "resend code"
              }
            >
              {cooldown > 0 ? `resend in ${cooldown}s` : "resend code"}
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
