import React, {useState} from "react";
import {NavLink} from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar(){
    const [open, setOpen] = useState(false);
    
    return(
        <>
        <aside className={`sidebar ${open ? "is-open":"is-closed"}`} 
        aria-label="navigator">
            <div className="sb-logo">
                <div className="sb-name">help n seek</div>
            </div>

            <nav className="sb-nav">
                <div className="sb-section">
                    <div className="sb-title">General</div>
                    <NavLink to="/" className="sb-item">Home</NavLink>
                    <NavLink to="/" className="sb-item">Settings</NavLink>
                    <NavLink to="/profile" className="sb-item">Profile</NavLink>
                    <NavLink to="/" className="sb-item">Inbox</NavLink>
                </div>
                <div className="sb-section">
                    <div className="sb-title">Browse</div>
                    <NavLink to="/" className="sb-item">Losses</NavLink>
                    <NavLink to="/" className="sb-item">Finds</NavLink>
                </div>
            </nav>
            <div className="sb-footer">
                <button className="sb-logout">log out</button>
            </div>
        </aside>
        <button className="sb-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Collapse sidebar":"Expand sidebar"}>
                <span className="click">{open ? ">" : "<"}</span>
        </button>
        </>
    );
}

export default Sidebar;