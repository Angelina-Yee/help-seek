import React from "react";
import { Link } from "react-router-dom";
import "../styles/howItWorks.css";

function HowItWorks2() {
  return (
    <div className="how-it-works-page">
      <header className="navbar">
        <div className="logo">help n seek</div>
      </header>

      <main className="how-content">
        <div className="hero-section">
          <h1>How It Works</h1>
          <p className="hero-subtitle">
            Lost something? Found something? Here's how to connect with others
            in your community.
          </p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Account</h3>
              <p>
                Sign up with your email and create a profile. Add your photo and
                basic info to help others recognize you when arranging meetups.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Post Your Item</h3>
              <p>
                <strong>Lost something?</strong> Describe what you lost, when,
                and where. Upload photos if you have them.
                <br />
                <strong>Found something?</strong> Post details and photos of the
                item you found.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Browse & Search</h3>
              <p>
                Look through lost and found posts. Use filters by category,
                location, and date to find what you're looking for faster.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Connect Safely</h3>
              <p>
                Message the poster through our secure inbox. Verify ownership
                and arrange a safe public meetup location.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Complete the Exchange</h3>
              <p>
                Meet in a safe public place. Verify the item and complete the
                return. Both parties can leave feedback to build community
                trust.
              </p>
            </div>
          </div>
        </div>

        <div className="tips-section">
          <h2>Safety Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>🏪 Meet in Public</h4>
              <p>
                Always meet at busy, well-lit public places like coffee shops or
                malls.
              </p>
            </div>
            <div className="tip-card">
              <h4>🕐 Daytime Meetings</h4>
              <p>Arrange meetups during daylight hours when possible.</p>
            </div>
            <div className="tip-card">
              <h4>🆔 Verify Identity</h4>
              <p>Ask for additional proof of ownership for valuable items.</p>
            </div>
            <div className="tip-card">
              <h4>👥 Bring a Friend</h4>
              <p>
                Consider bringing someone with you, especially for high-value
                items.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="page-footer">
        <div className="footer-content">
          <div className="logo">help n seek</div>
          <p>Connecting communities, one lost item at a time.</p>
        </div>
      </footer>
    </div>
  );
}

export default HowItWorks2;
