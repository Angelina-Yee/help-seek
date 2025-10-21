import React from "react";
import "../styles/landing.css";
import HowItWorks from "./howItWorks";

function landing() {
  return (
    <div className="Land1">
      {/*Navbar*/}
      <header className="navbar">
        <div className="logo">help n seek</div>
        <nav>
          <a href="/instructions" className="how-link">how it works</a>
          <a href="/signup1">sign in</a>
        </nav>
      </header>
      {/*Hero*/}
      <section className="hero">
        <h1>
          welcome...
          <br />
          <span>to the digital lost &amp; found</span>
        </h1>
      </section>
      <section className="how-section">
        <HowItWorks/>
      </section>

    </div>
  );
}

export default landing;
