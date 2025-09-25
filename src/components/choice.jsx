import React, {useEffect, useState, useRef} from "react";
import {createPortal} from "react-dom";
import NewPost from "../components/newPost";
import "../styles/choice.css";

function Choice({onClose, onPick}) {
    const dialogRef = useRef(null);
    const [shownewPost, setShowNewPost] = useState(false);

    // Track the chosen type to pass to NewPost
    const [chosenType, setChosenType] = useState(null);

    // Prevent background scrolling during popup
        useEffect(() => {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return() => (document.body.style.overflow = prev);
        }, []);
    
    // Closing the Settings Popup
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const onBackdrop = (e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
    };

    const pick = (type) => {
        if (onPick) onPick(type);
        setChosenType(type);
        setShowNewPost(true);
    };

  return createPortal(
    <div className="choice-overlay" onMouseDown={onBackdrop} aria-modal="true" role="dialog">
        <div className="choice-dialog" ref={dialogRef} role="document">
            <button className="choice-close" onClick={onClose} aria-label="Close">X</button>
            <div className="choice-actions">
                <button className="choice-btn" aria-label="create" onClick={() => pick("loss")}>
                    Loss
                </button>
                <button className="choice-btn" aria-label="create" onClick={() => pick("find")}>
                    Find
                </button>
            </div>
        </div>
        {shownewPost && chosenType && (
          <NewPost
            onClose={() => setShowNewPost(false)}
            onBack={() => setShowNewPost(false)}
            postType={chosenType}
          />
        )}
    </div>,
    document.body
  );
}

export default Choice;
