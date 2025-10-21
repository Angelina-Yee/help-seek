import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/termsofservice.css";

function TermsOfService() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="terms-page">
      <header className="terms-navbar">
        <button
          onClick={handleGoBack}
          className="terms-logo"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          help n seek
        </button>
        <nav></nav>
      </header>

      <div className="terms-container">
        <div className="terms-content">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last updated: October 21, 2025</p>

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Help n Seek ("the Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              Help n Seek is a platform that connects users who need assistance
              with those willing to provide help. Users can post requests for
              help and respond to others' requests within their community.
            </p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>
              To use certain features of the Service, you must register for an
              account. You are responsible for:
            </p>
            <ul>
              <li>
                Maintaining the confidentiality of your account credentials
              </li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Updating your information to keep it current</li>
            </ul>
          </section>

          <section>
            <h2>4. User Conduct</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Spam or send unsolicited communications</li>
              <li>Share inappropriate, offensive, or harmful content</li>
              <li>Attempt to gain unauthorized access to other accounts</li>
            </ul>
          </section>

          <section>
            <h2>5. Content and Safety</h2>
            <p>
              All user communications and content are monitored for user safety
              and to ensure compliance with these terms. We reserve the right to
              remove content that violates our policies.
            </p>
            <p>
              Users should exercise caution when meeting others in person and
              should meet in public places when possible.
            </p>
          </section>

          <section>
            <h2>6. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy
              to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2>7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by Help n Seek and are protected by international
              copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>
              Help n Seek is a platform that facilitates connections between
              users. We are not responsible for the quality, safety, or legality
              of help provided through the Service. Users interact at their own
              risk.
            </p>
          </section>

          <section>
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without
              prior notice, for conduct that we believe violates these Terms of
              Service or is harmful to other users of the Service, us, or third
              parties.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              notify users of any changes by posting the new Terms of Service on
              this page. Your continued use of the Service after such
              modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at support@helpnseek.com.
            </p>
          </section>

          <div className="back-to-home">
            <button onClick={handleGoBack} className="back-btn">
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
