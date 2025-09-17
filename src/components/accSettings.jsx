import React, {useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import "../styles/accSettings.css";

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
    <div className="accSettings-overlay" onMouseDown={onBackdrop} aria-modal="true" role="dialog">
        <div className="accSettings-dialog" ref={dialogRef} role="document">
            <button className="accSettings-close" onClick={onClose} aria-label="Close">X</button>
            <div className="accSettings-actions">
                <button className="accSettings-btn">
                    Delete Account
                </button>
                <button className="accSettings-btn">
                    Notification Preference
                </button>
                <button className="accSettings-btn">
                    Reset Password
                </button>
            </div>
        </div>
    </div>,
    document.body
  );
}

export default AccSettings;