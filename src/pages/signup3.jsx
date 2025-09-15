import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup3.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Signup3() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const signupToken = sessionStorage.getItem("signupToken");
  const signupEmail = sessionStorage.getItem("signupEmail");

  useEffect(() => {
    if (!signupToken) navigate("/signup1", { replace: true });
  }, [signupToken, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    isFirstNameValid && isLastNameValid && isPasswordValid && isPasswordMatching;

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

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete signup");

      let ok = false;
      if (data?.accessToken) {
        ok = persistAuth(data.accessToken, data.user);
      }
      if (!ok) {
        const login = await fallbackLogin(signupEmail, formData.newPassword);
        ok = persistAuth(login?.accessToken, login?.user);
      }
      if (!ok) throw new Error("Could not persist auth. Please try logging in.");

      sessionStorage.removeItem("signupToken");
      sessionStorage.removeItem("signupEmail");

      await new Promise((r) => setTimeout(r, 60));
      window.location.replace("/profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
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
                  minLength="1"
                  required
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
                  required
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
              required
            />

            <label htmlFor="confirmPassword">confirm password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />

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