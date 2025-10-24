import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/privacyPolicy.css";

function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="privacy-page">
      <header className="privacy-navbar">
        <button
          onClick={handleGoBack}
          className="privacy-logo"
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

      <div className="privacy-container">
        <div className="privacy-content">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: October 21, 2025</p>

          <section>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as:</p>
            <ul>
              <li>Account information (name, email, password)</li>
              <li>Profile information and preferences</li>
              <li>Messages and communications through our platform</li>
              <li>Help requests and responses you post</li>
              <li>Location information (if you choose to share it)</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Connect you with other users for help requests</li>
              <li>Send you notifications and updates</li>
              <li>Monitor for safety and security purposes</li>
              <li>Respond to your questions and provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>3. Information Sharing</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>With other users when you post help requests or responses</li>
              <li>With your consent or at your direction</li>
              <li>For legal reasons or to protect safety</li>
              <li>In connection with a business transaction</li>
              <li>
                With service providers who assist us in operating our platform
              </li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2>5. Message Monitoring</h2>
            <p>
              For user safety and to ensure compliance with our terms of
              service, all messages and communications on our platform are
              monitored. We may review, store, and analyze communications to:
            </p>
            <ul>
              <li>Prevent harassment and inappropriate behavior</li>
              <li>Detect and prevent fraud</li>
              <li>Ensure compliance with our community guidelines</li>
              <li>Respond to legal requests</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active
              or as needed to provide services. We may retain certain
              information after account deletion for legitimate business
              purposes or legal requirements.
            </p>
          </section>

          <section>
            <h2>7. Your Rights and Choices</h2>
            <p>You may:</p>
            <ul>
              <li>Access and update your account information</li>
              <li>Delete your account (some information may be retained)</li>
              <li>Opt out of certain communications</li>
              <li>Request information about data we have collected</li>
            </ul>
          </section>

          <section>
            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to improve your
              experience, analyze usage, and provide personalized content. You
              can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2>9. Third-Party Links</h2>
            <p>
              Our service may contain links to third-party websites. We are not
              responsible for the privacy practices of these external sites. We
              encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              Our service is intended for users 18 and older. We do not
              knowingly collect personal information from children under 18. If
              we discover such information, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you
              of significant changes by posting the new policy on this page and
              updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data
              practices, please contact us at helpnseek@gmail.com.
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

export default PrivacyPolicy;
