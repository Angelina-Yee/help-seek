import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "../styles/settings.css";

function Settings({ onClose }) {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const [showReportMessage, setShowReportMessage] = useState(false);

  //Closing the Settings Popup
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onBackdrop = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
  };

  const handleTermsClick = () => {
    navigate("/terms");
    onClose();
  };

  const handlePrivacyClick = () => {
    navigate("/privacy");
    onClose();
  };

  const handleReportClick = () => {
    setShowReportMessage(true);
  };

  const handleReportClose = () => {
    setShowReportMessage(false);
  };

  return createPortal(
    <div
      className="settings-overlay"
      onMouseDown={onBackdrop}
      aria-modal="true"
      role="dialog"
    >
      <div className="settings-dialog" ref={dialogRef} role="document">
        <button className="settings-close" onClick={onClose} aria-label="Close">
          X
        </button>
        <div className="settings-actions">
          <button className="settings-btn" onClick={handleTermsClick}>
            Terms of Service
          </button>
          <button className="settings-btn" onClick={handlePrivacyClick}>
            Privacy Policy
          </button>
          <button className="settings-btn" onClick={handleReportClick}>
            Report
          </button>
        </div>
      </div>
      
      {showReportMessage && (
        <div className="settings-overlay" onMouseDown={(e) => e.stopPropagation()}>
          <div className="settings-dialog" role="document">
            <button className="settings-close" onClick={handleReportClose} aria-label="Close">
              X
            </button>
            <h3 className="settings-confirm-title" style={{ textAlign: 'center' }}>Report an Issue</h3>
            <p className="settings-confirm-message">
              To report inappropriate content, technical issues, or other concerns, 
              please contact Help N Seek team directly.
            </p>
            <div style={{ 
              textAlign: 'center', 
              margin: '20px 0',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '2px solid var(--blue)',
              borderRadius: '8px'
            }}>
              <p style={{ 
                margin: '0 0 10px 0', 
                fontWeight: '600',
                color: 'var(--blue)',
                fontSize: '16px'
              }}>
                Email Support:
              </p>
              <p style={{ 
                margin: '0', 
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--blue)',
                fontFamily: 'monospace'
              }}>
                helpnseek@gmail.com
              </p>
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              textAlign: 'center',
              margin: '15px 0 0 0'
            }}>
              We appreciate your feedback and will respond promptly to all reports.
            </p>
            <div className="settings-confirm-actions">
              <button 
                className="settings-btn settings-btn-primary" 
                onClick={handleReportClose}
                style={{ width: '90px', maxWidth: '90px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

export default Settings;
