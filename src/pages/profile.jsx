import React, {useEffect, useMemo, useState} from "react";
import "../styles/profile.css";
import {Link} from "react-router-dom";
import Postcard from "../components/postcard";
import AccSettings from "../components/accSettings";
import {charById, colorById} from "../lib/avatarCatalog";

// API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Profile Page
function Profile() {
  const [name, setUserName] = useState("");
  const [avatarCharId, setAvatarCharId] = useState("raccoon");
  const [avatarColor, setAvatarColor] = useState("blue");

  const activeChar = useMemo(() => charById(avatarCharId), [avatarCharId]);
  const glowColor = useMemo(() => colorById(avatarColor), [avatarColor]);

  const [loading, setLoading] = useState(true);
  const [showAccSettings, setShowAccSettings] = useState(false);

  // real posts state
  const [posts, setPosts] = useState([]);

  // Fetch user profile
  useEffect(() => {
    (async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API}/api/profile/me`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUserName(data.name || "");
        if (data.avatarCharId) setAvatarCharId(data.avatarCharId);
        if (data.avatarColor) setAvatarColor(data.avatarColor);
      }
      setLoading(false);

      // Load Posts
      try {
        const pRes = await fetch(`${API}/api/posts/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const pData = await pRes.json().catch(() => []);
        if (pRes.ok) setPosts(pData);
      } catch {}
    })();
  }, []);

  // Fake data
  const stats = [
    { value: posts.filter(p => p.type === "find").length, label: "finds" },
    { value: 10, label: "helped" },
    { value: posts.filter(p => p.type === "loss").length, label: "losses" },
  ];

  // create New Post
  useEffect(() => {
    function onCreated(e) {
      const created = e.detail;
      if (created && created._id) {
        setPosts(prev => [created, ...prev]);
      } else {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        fetch(`${API}/api/posts/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then(r => r.json())
          .then(d => Array.isArray(d) && setPosts(d))
          .catch(() => {});
      }
    }
    window.addEventListener("post:created", onCreated);
    return () => window.removeEventListener("post:created", onCreated);
  }, []);

  // Loading state
  if (loading) return <div className="prof">Loading…</div>;

  //HTML
  return (
    <div className="prof">
      <header className="navbar"><div className="logo">help n seek</div></header>

      <div className="prof-container">
        <section className="prof-box">
          <h1 className="prof-title">Hello,<br />{name}</h1>
          <div className="prof-actions">
            <Link to="/editProfile" className="prof-link">Edit Profile</Link>
            <button className="prof-link-settings" aria-label="create" onClick={() => setShowAccSettings(true)}>
              Settings
            </button>
          </div>
        </section>

        {/*Help image cropping please*/}
        <aside className="prof-stamp" style={{ "--glow": glowColor }}> 
          <div className="stamp-frame">
            <img
              className="racc-img"
              src={activeChar.src}
              alt="Profile avatar"
              style={{
                width: "180px",
                height: "auto",
                transform: `translate(${(activeChar.previewX ?? 0) + 20}px, ${(activeChar.previewY ?? 0) + 6}px) scale(${(activeChar.previewScale ?? 1) * 0.92})`,
                transformOrigin: "center center",
                filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.15))",
              }}
            />
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
        {posts.length === 0 && <div className="empty">No posts yet.</div>}
        {posts.map((p) => (
          <Postcard
            key={p._id || p.id}
            name={name}
            date={new Date(p.createdAt || Date.now()).toLocaleDateString()}
            title={p.title}
            location={p.location}
            desc={p.description || p.desc}
            imageSrc={p.imageUrl ? `${API}${p.imageUrl}` : undefined}
            avatarSrc={activeChar.src}
            avatarBgColorHex={glowColor}
          />
        ))}
      </section>
      {showAccSettings && <AccSettings onClose={() => setShowAccSettings(false)} />}
    </div>
  );
}

export default Profile;
