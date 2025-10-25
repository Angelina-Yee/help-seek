import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/settings.css";

// API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function NotificationPreferences({ onClose, onCancel }) {
  const dialogRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true
  });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const onBackdrop = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) onCancel();
  };

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${API}/api/profile/notification-preferences`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setPreferences(data.preferences || {
            emailNotifications: true
          });
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API}/api/profile/notification-preferences`, {
        method: "PUT",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ preferences })
      });

      if (res.ok) {
        onClose();
      } else {
        alert("Failed to save notification preferences. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while saving preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return createPortal(
      <div className="settings-overlay" onMouseDown={onBackdrop} aria-modal="true" role="dialog">
        <div className="settings-dialog" ref={dialogRef} role="document">
          <div className="settings-loading">Loading preferences...</div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="settings-overlay" onMouseDown={onBackdrop} aria-modal="true" role="dialog">
      <div className="settings-dialog settings-notification-dialog" ref={dialogRef} role="document">
        <button className="settings-close" onClick={onClose} aria-label="Close">
          X
        </button>
        
        <h3 className="settings-title">Notification Preferences</h3>
        
        <div className="notification-preferences">
          <div className="notification-item">
            <div className="notification-info">
              <h4>Email Notifications</h4>
              <p>Receive notifications via email</p>
            </div>
            <label className="notification-toggle">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => togglePreference('emailNotifications')}
                disabled={saving}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-confirm-actions">
          <button 
            className="settings-btn settings-btn-cancel" 
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            className="settings-btn settings-btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default NotificationPreferences;
