import React, { useEffect, useState } from "react";
import "../styles/profile.css";
import { Link, useNavigate } from "react-router-dom";
import raccoon from "../assets/raccoon.png";
import Postcard from "../components/postcard";
import AccSettings from "../components/accSettings";
import { getJson } from "../api";

// Profile Page
function Profile() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("...");
  const [loading, setLoading] = useState(true);
  const [showAccSettings, setShowAccSettings] = useState(false);

  // Fetch user profile
  useEffect(() => {
    (async () => {
      try {
        const data = await getJson("/api/profile/me");
        // prefer real name; fallback to email prefix
        const nice = data?.name || (data?.email ? data.email.split("@")[0] : "Friend");
        setUserName(nice);
      } catch (e) {
        alert(e.message || "Please log in again");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // Fake data
  const stats = [
    { value: 1, label: "finds" },
    { value: 10, label: "helped" },
    { value: 0, label: "losses" },
  ];
  const posts = [
    { id: 1, name: "John Doe", title: "Lost Water Bottle", location: "Geisel Library", desc: "Blue stanley..." },
  ];

  // Loading state
  if (loading) return <div className="prof">Loading…</div>;

  //HTML
  return (
    <div className="prof">
      <header className="navbar"><div className="logo">help n seek</div></header>

      <div className="prof-container">
        <section className="prof-box">
          <h1 className="prof-title">Hello,<br />{userName}</h1>
          <div className="prof-actions">
            <Link to="/editProfile" className="prof-link">Edit Profile</Link>
            <button className="prof-link-settings" aria-label="create" onClick={() => setShowAccSettings(true)}>
              Settings
            </button>
          </div>
        </section>

        <aside className="prof-stamp">
          <div className="stamp-frame">
            <img className="racc-img" src={raccoon} alt="Profile avatar" />
          </div>
        </aside>
      </div>

      <div className="prof-stats">
        {stats.map((s, i) => (
          <React.Fragment key={i}>
            <div className="stat">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
            {i < stats.length - 1 && <div className="stat-divider" />}
          </React.Fragment>
        ))}
      </div>

      <section className="prof-posts">
        <div className="posts-header"><h3>Your posts</h3></div>
        {posts.map((p) => (
          <Postcard key={p.id} name={p.name} date={p.date} title={p.title} location={p.location} desc={p.desc} />
        ))}
      </section>
      {showAccSettings && <AccSettings onClose={() => setShowAccSettings(false)} />}
    </div>
  );
}

export default Profile;
