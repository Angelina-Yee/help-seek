import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import { setAccessToken } from "../api";
import Settings from "../components/settings";

// API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Sidebar component
function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const[showSettings, setShowSettings] = useState(false);

  // Handle user logout
  async function handleLogout() {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
      setAccessToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      sessionStorage.clear();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Could not log out. Please try again.");
    }
  }

  //Sidebar HTML
  return (
    <>
      <aside className={`sidebar ${open ? "is-open" : "is-closed"}`} aria-label="navigator">
        <div className="sb-logo"><div className="sb-name">help n seek</div></div>
            <nav className="sb-nav">
                <div className="sb-section">
                    <div className="sb-title">General</div>
                    <NavLink to="/home" className="sb-item">Home</NavLink>
                    <button className="settings-sb" onClick={() => setShowSettings(true)}>
                        Settings
                    </button>
                    <NavLink to="/profile" className="sb-item">Profile</NavLink>
                    <NavLink to="/others" className="sb-item">Inbox</NavLink>
                </div>
                <div className="sb-section">
                    <div className="sb-title">Browse</div>
                    <NavLink to="/lossFind" className="sb-item">Losses</NavLink>
                    <NavLink to="/findLoss" className="sb-item">Finds</NavLink>
                </div>
            </nav>
            <div className="sb-footer">
                <button className="sb-logout" onClick={handleLogout}>log out</button>
            </div>
        </aside>
        <button className="sb-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Collapse sidebar":"Expand sidebar"}>
                <span className="click">{open ? ">" : "<"}</span>
        </button>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
        </>
    );
}

export default Sidebar;