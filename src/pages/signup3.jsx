import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup.css";

function Signup3() {
  const navigate = useNavigate();
    const onSend = (e) => {
      e.preventDefault();
      navigate("/editProfile");
    };
  return(<div className="su1">
      {/*Navbar*/}
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <Link to="/instructions">how it works</Link>
        </nav>
      </header>
      {/*Hero*/}
      <div className="signup-container">
        <section className="signup-box">
          <div className="signup-header">
            <h2>sign up</h2>
            <span className="step">3/3</span>
          </div>
          <p className="login-text">
            already have an account? <a href="#">login</a>
          </p>

          <form className="signup-form" onSubmit={onSend}>
            <label htmlFor="email">email</label>
            <input type="email" id="email" name="email"/>
            <button type="submit" className="send-btn">
              verify
            </button>
          </form>
        </section>
      </div>
    </div>
    );
}

export default Signup3;
