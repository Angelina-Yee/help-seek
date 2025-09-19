import React, {useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import "../styles/settings.css";

function AccSettings({onClose}) {
    const dialogRef = useRef(null);

    //Closing the Settings Popup
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const onBackdrop = (e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
    };

  return createPortal(
    <div className="settings-overlay" onMouseDown={onBackdrop} aria-modal="true" role="dialog">
        <div className="settings-dialog" ref={dialogRef} role="document">
            <button className="settings-close" onClick={onClose} aria-label="Close">X</button>
            <div className="settings-actions">
                <button className="settings-btn">
                    Delete Account
                </button>
                <button className="settings-btn">
                    Notification Preference
                </button>
                <button className="settings-btn">
                    Reset Password
                </button>
            </div>
        </div>
    </div>,
    document.body
  );
}

export default AccSettings;