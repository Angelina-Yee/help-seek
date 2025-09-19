import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup2.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Verify email code
function Signup2() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const email = sessionStorage.getItem("signupEmail");

  // Redirect back if no email
  useEffect(() => {
    if (!email) navigate("/signup1", { replace: true });
    const first = document.getElementById("code-0");
    first && first.focus();
  }, [email, navigate]);

  // Code input changes
  const handleCodeChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    setErr("");
    if (value && index < 4) document.getElementById(`code-${index + 1}`)?.focus();
  };

  // Backspace to go back
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) document.getElementById(`code-${index - 1}`)?.focus();
  };

  // paste event
  const handlePaste = (e) => {
    const t = (e.clipboardData.getData("text") || "").trim();
    if (!/^\d{5}$/.test(t)) return;
    setCode(t.split(""));
    setErr("");
    document.getElementById("code-4")?.focus();
    e.preventDefault();
  };

  // Check if code is complete
  const isCodeComplete = code.every((d) => d !== "");

  // Confirm code submission
  const onConfirm = async (e) => {
    e.preventDefault();
    if (!isCodeComplete || loading) return;
    try {
      setLoading(true);
      setErr("");
      const fullCode = code.join("");
      const res = await fetch(`${API}/auth/signup/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid or expired code");
      sessionStorage.setItem("signupToken", data.signupToken);
      navigate("/signup3", { replace: true });
    } catch (er) {
      setErr(er.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const onResendCode = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch(`${API}/auth/signup/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code");
      alert("A new code has been sent to your email.");
      setCode(["", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
    } catch (er) {
      setErr(er.message || "Could not resend code.");
    } finally {
      setLoading(false);
    }
  };

  // HTML
  return (
    <div className="su2">
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav><Link to="/instructions">how it works</Link></nav>
      </header>

      <div className="signup-container2">
        <section className="signup-box2">
          <div className="signup-header2">
            <h2>sign up</h2><span className="step2">2/3</span>
          </div>
          <p className="auth-text">please enter your authentication code below.</p>

          <form className="signup-form2" onSubmit={onConfirm} noValidate>
            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input key={index} id={`code-${index}`} type="text" inputMode="numeric" pattern="[0-9]*"
                  maxLength={1} value={digit} onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)} className="code-input" disabled={loading}
                  aria-label={`digit ${index + 1}`} />
              ))}
            </div>

            {err && <div className="error" role="alert" style={{ marginTop: 8 }}>{err}</div>}

            <button type="button" className="resend-btn" onClick={onResendCode} disabled={loading}>resend code</button>
            <button type="submit" className="confirm-btn" disabled={!isCodeComplete || loading}>
              {loading ? "verifying..." : "confirm"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Signup2;