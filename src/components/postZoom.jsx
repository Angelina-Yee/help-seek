import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Image zoom
export default function PostZoom({ src, alt = "image", onClose }) {
  const dialogRef = useRef(null);

  // Prevent background scrolling
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // close on backdrop click
  function onBackdrop(e) {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
  }

  // HTML
  return createPortal(
    <div className="pz-overlay" role="dialog" aria-modal="true" onMouseDown={onBackdrop}>
      <div className="pz-dialog" ref={dialogRef}>
        <img className="pz-img" src={src} alt={alt} />
        <button className="pz-close" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>,
    document.body
  );
}
