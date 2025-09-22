import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/forgotpassword3.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function ForgotPassword3() {
  const navigate = useNavigate();
  const resetToken = sessionStorage.getItem("resetToken");
  const email = sessionStorage.getItem("forgotEmail"); // optional, if needed server-side

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // redirect if token missing
  useEffect(() => {
    if (!resetToken) navigate("/forgot-password", { replace: true });
  }, [resetToken, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // password validation
  const pwStrong =
    form.newPassword.length >= 8 &&
    /[a-z]/.test(form.newPassword) &&
    /[A-Z]/.test(form.newPassword) &&
    /\d/.test(form.newPassword) &&
    /[^A-Za-z0-9]/.test(form.newPassword);

  const pwMatch =
    form.newPassword !== "" &&
    form.confirmPassword !== "" &&
    form.newPassword === form.confirmPassword;

  const formValid = pwStrong && pwMatch;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formValid || !resetToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/forgot-password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`,
        },
        body: JSON.stringify({
          password: form.newPassword,
          email, // send if backend expects it; remove if not needed
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      // cleanup
      sessionStorage.removeItem("resetToken");
      // navigate to login
      navigate("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp3">
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <Link to="/instructions">how it works</Link>
        </nav>
      </header>

      <div className="reset-container3">
        <section className="reset-box3">
          <div className="reset-header3">
            <h2>create new password</h2>
            <span className="step3">3/3</span>
          </div>
          <form className="reset-form3" onSubmit={onSubmit}>
            <div className="reset-middle">
              <label htmlFor="newPassword">new password</label>
              <div className="password-container">
                <input
                  type={showNew ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  aria-invalid={pwStrong ? "false" : "true"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showNew ? "Hide password" : "Show password"}
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.42-.08.65 0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  )}
                </button>
              </div>
              <div
                className={`pw-hint-slot ${
                  !pwStrong && form.newPassword ? "show" : ""
                }`}
                aria-live="polite"
              >
                {!pwStrong && form.newPassword
                  ? "8+ chars upper, lower, number, special."
                  : ""}
              </div>

              <label htmlFor="confirmPassword">re-enter password</label>
              <div className="password-container">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  aria-invalid={pwMatch ? "false" : "true"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.42-.08.65 0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  )}
                </button>
              </div>
              <div
                className={`pw-hint-slot ${
                  !pwMatch && form.confirmPassword ? "error show" : ""
                }`}
                aria-live="polite"
              >
                {!pwMatch && form.confirmPassword
                  ? "passwords do not match"
                  : ""}
              </div>
            </div>

            <div className="reset-footer">
              <button
                type="submit"
                className="reset-btn"
                disabled={!formValid || loading}
              >
                {loading ? "saving..." : "reset password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword3;
