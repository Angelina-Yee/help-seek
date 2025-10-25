import React, {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import { useNavigate } from "react-router-dom";
import NotificationPreferences from "./NotificationPreferences";
import "../styles/settings.css";

// API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function AccSettings({onClose}) {
    const dialogRef = useRef(null);
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    //Closing the Settings Popup
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const onBackdrop = (e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
    };

    const handleDeleteAccount = async () => {
        if (isDeleting || !password.trim()) return;
        
        setPasswordError("");
        setIsDeleting(true);
        
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            
            const response = await fetch(`${API}/api/profile/me`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password: password.trim() })
            });

            if (response.ok) {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                navigate("/", { replace: true });
            } else {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    setPasswordError(errorData.message || "Incorrect password");
                } else {
                    alert(errorData.message || "Failed to delete account. Please try again.");
                }
            }
        } catch (error) {
            console.error("Delete account error:", error);
            alert("An error occurred while deleting your account. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setPassword("");
        setPasswordError("");
        setShowDeleteConfirm(false);
    };

  return createPortal(
    <div className="settings-overlay" onMouseDown={onBackdrop} aria-modal="true" role="dialog">
        <div className="settings-dialog" ref={dialogRef} role="document">
            <button className="settings-close" onClick={onClose} aria-label="Close">X</button>
            <div className="settings-actions">
                <button 
                    className="settings-btn settings-btn-danger" 
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
                <button 
                    className="settings-btn" 
                    onClick={() => setShowNotificationPrefs(true)}
                >
                    Notification Preference
                </button>
                <button 
                    className="settings-btn" 
                    onClick={() => navigate("/forgot-password")}
                >
                    Reset Password
                </button>
            </div>
        </div>
        
        {showDeleteConfirm && (
            <div className="settings-overlay" onMouseDown={(e) => e.stopPropagation()}>
                <div className="settings-dialog settings-confirm-dialog" role="document">
                    <button className="settings-close" onClick={handleCancelDelete} aria-label="Close">
                        X
                    </button>
                    <h3 className="settings-confirm-title">Delete Account</h3>
                    <p className="settings-confirm-message">
                        Are you sure you want to delete your account? This action cannot be undone.
                        All your posts, messages, and data will be permanently removed.
                    </p>
                    
                    <div className="settings-password-section">
                        <label htmlFor="delete-password" className="settings-password-label">
                            Enter Password to Confirm:
                        </label>
                        <input
                            id="delete-password"
                            type="password"
                            className={`settings-password-input ${passwordError ? 'error' : ''}`}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (passwordError) setPasswordError("");
                            }}
                            placeholder="Current password..."
                            disabled={isDeleting}
                            autoComplete="current-password"
                        />
                        {passwordError && (
                            <div className="settings-password-error">{passwordError}</div>
                        )}
                    </div>
                    
                    <div className="settings-confirm-actions">
                        <button 
                            className="settings-btn settings-btn-cancel" 
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button 
                            className="settings-btn settings-btn-danger" 
                            onClick={handleDeleteAccount}
                            disabled={isDeleting || !password.trim()}
                        >
                            {isDeleting ? "Deleting..." : "Delete Account"}
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {showNotificationPrefs && (
            <NotificationPreferences 
                onClose={() => setShowNotificationPrefs(false)} 
                onCancel={() => setShowNotificationPrefs(false)}
            />
        )}
    </div>,
    document.body
  );
}

export default AccSettings;