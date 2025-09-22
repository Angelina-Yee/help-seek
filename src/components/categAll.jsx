import React, {useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import "../styles/choice.css";
import { useNavigate } from "react-router-dom";

function CategAll({onClose}) {
    const lfCategories = ["Books", "Clothing", "Electronics", "ID", "Wallet", "Water Bottle", "Others"];
    const navigate = useNavigate();
    const goToCateg = () => {
        navigate("/lossFind");
    };
    const dialogRef = useRef(null);

    //Prevent background scrolling during popup
        useEffect(() => {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return() => (document.body.style.overflow = prev);
        }, []);
    
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
    <div className="choice-overlay" onMouseDown={onBackdrop} aria-modal="true" role="dialog">
        <div className="choice-dialog" ref={dialogRef} role="document">
            <button className="choice-close" onClick={onClose} aria-label="Close">X</button>
            <div className="categ-actions">
                {lfCategories.map((c) => (
                    <button key={c} className="categ-btn" onClick={goToCateg}>{c}</button>
                ))}
            </div>
        </div>
    </div>,
    document.body
  );
}

export default CategAll;