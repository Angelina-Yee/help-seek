import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import { setAccessToken } from "../api";
import Settings from "../components/settings";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Sidebar({ inboxUnread = 0 }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  async function handleLogout() {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setAccessToken(null);
      localStorage.clear();
      sessionStorage.clear();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Could not log out. Please try again.");
    }
  }

  return (
    <>
      <aside
        className={`sidebar ${open ? "is-open" : "is-closed"}`}
        aria-label="navigator"
      >
        <div className="sb-logo">
          <div className="sb-name">help n seek</div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section">
            <div className="sb-title">General</div>

            <NavLink to="/home" className="sb-item">
              Home
            </NavLink>

            <button
              className="settings-sb"
              onClick={() => setShowSettings(true)}
              type="button"
            >
              Settings
            </button>

            <NavLink to="/profile" className="sb-item">
              Profile
            </NavLink>

            {}
            <NavLink to="/inbox" className="sb-item">
              Inbox
            </NavLink>
          </div>

          <div className="sb-section">
            <div className="sb-title">Browse</div>
            <NavLink to="/lossFind" className="sb-item">
              Losses
            </NavLink>
            <NavLink to="/findLoss" className="sb-item">
              Finds
            </NavLink>
          </div>
        </nav>

        <div className="sb-footer">
          <button className="sb-logout" onClick={handleLogout} type="button">
            log out
          </button>
        </div>
      </aside>

      <button
        className="sb-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        type="button"
      >
        <span className="click">{open ? ">" : "<"}</span>
      </button>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  );
}

export default Sidebar;
