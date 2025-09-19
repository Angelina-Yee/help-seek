import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup3.css";

//API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Final signup step
function Signup3() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
  })

  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

  //Retrieve stored token and email
  const signupToken = sessionStorage.getItem("signupToken");
  const signupEmail = sessionStorage.getItem("signupEmail");

  //Redirect back if no token is stored
  useEffect(() => {
    if (!signupToken) navigate("/signup1", { replace: true });
  }, [signupToken, navigate]);

  // Toggle functions for password visibility
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  //From input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true}));
  };

  //Check basic validation
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

  const showFirstNameHint =
    touched.firstName && formData.firstName !== "" && !isFirstNameValid;
  const showLastNameHint =
    touched.lastName && formData.lastName !== "" && !isLastNameValid;

  //Save auth details locally
  const persistAuth = (accessToken, user) => {
    if (!accessToken) return false;
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("token", accessToken);
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("token", accessToken);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      document.cookie = `token=${accessToken}; path=/; SameSite=Lax`;

      localStorage.setItem("isAuthenticated", "true");
      return true;
    } catch {
      return false;
    }
  };

  // Fallback login function
  const fallbackLogin = async (email, password) => {
    if (!email || !password) return null;
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
  };

  //Submit final signup
  const onSignup = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/signup/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${signupToken}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.newPassword,
        }),
      });

      // API response handling
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete signup");

      // Persist auth
      let ok = false;
      if (data?.accessToken) {
        ok = persistAuth(data.accessToken, data.user);
      }
      if (!ok) {
        const login = await fallbackLogin(signupEmail, formData.newPassword);
        ok = persistAuth(login?.accessToken, login?.user);
      }
      if (!ok)
        throw new Error("Could not persist auth. Please try logging in.");

      //Clear temporary storage
      sessionStorage.removeItem("signupToken");
      sessionStorage.removeItem("signupEmail");

      // Redirect to profile
      await new Promise((r) => setTimeout(r, 60));
      window.location.replace("/profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
    if (score >= 3) return { score: 3, label: "Strong" };
    if (score === 2) return { score: 2, label: "Medium" };
    return { score: 1, label: "Weak" };
  };

  const strength = getPasswordStrength(formData.newPassword);
  const widthMap = ["0%", "33%", "66%", "100%"];
  const classMap = ["", "weak", "medium", "strong"];

  //HTML
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
      <div className="signup-container3">
        <section className="signup-box3">
          <div className="signup-header3">
            <h2>sign up</h2>
            <span className="step3">3/3</span>
          </div>

          <form className="signup-form3" onSubmit={onSignup}>
            <div className="name-row">
              <div className="name-field">
                <label htmlFor="firstName">first name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  minLength="1"
                  required
                  pattern="[A-Z][A-Za-z]*"
                  title="First name must start with a capital letter and contain only letters."
                  aria-invalid={showFirstNameHint ? "true" : "false"}
                />
                {showFirstNameHint && (
                  <div className="name-hint error" aria-live="polite">
                    start with uppercase
                  </div>
                )}
              </div>

              <div className="name-field">
                <label htmlFor="lastName">last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  minLength="1"
                  required
                  pattern="[A-Z][A-Za-z]*"
                  title="Last name must start with a capital letter and contain only letters."
                  aria-invalid={showLastNameHint ? "true" : "false"}
                />
                {showLastNameHint && (
                  <div className="name-hint error" aria-live="polite">
                    start with uppercase
                  </div>
                )}
              </div>
            </div>

            <label htmlFor="newPassword">new password</label>
            <div className="password-container">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                minLength="8"
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                onClick={toggleNewPasswordVisibility}
              >
                {showNewPassword ? (
                  // closed eye svg
                  <svg viewBox="0 0 24 24">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.42-.08.65 0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                ) : (
                  // open eye svg
                  <svg viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                )}
              </button>
            </div>

            {/* strength indicator (fixed height so no layout jump) */}
            <div className="pw-strength" aria-live="polite">
              <div className="pw-track">
                <div
                  className={`pw-fill ${classMap[strength.score]}`}
                  style={{ width: widthMap[strength.score] }}
                />
              </div>
              <div className="pw-text">{strength.label}</div>
            </div>

            <label htmlFor="confirmPassword">confirm password</label>
            <div className="password-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
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

            <button
              type="submit"
              className="signup-btn"
              disabled={!isFormValid || loading}
            >
              {loading ? "creating..." : "sign up"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Signup3;