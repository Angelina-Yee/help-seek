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

  // Real posts state
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

      // Load Posts
      try {
        const pRes = await fetch(`${API}/api/posts/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const pData = await pRes.json().catch(() => []);
        if (pRes.ok) setPosts(pData);
      } catch {}

      // Load Stats
      try {
        const sRes = await fetch(`${API}/api/posts/stats`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const sData = await sRes.json().catch(() => null);
        if (sRes.ok && sData) {
          setStatsState({
            finds: Number(sData.finds ?? 0),
            resolved: Number(sData.resolved ?? 0),
            losses: Number(sData.losses ?? 0),
          });
        } else {
          setStatsState(prev => {
            const finds0 = Array.isArray(posts) ? posts.filter(p => (p.type || "").toLowerCase() === "find").length : 0;
            const losses0 = Array.isArray(posts) ? posts.filter(p => (p.type || "").toLowerCase() === "loss").length : 0;
            return { ...prev, finds: finds0, losses: losses0 };
          });
        }
      } catch {}

      setLoading(false);
    })();
  }, []);

  // Stats 
  const [statsState, setStatsState] = useState({ finds: 0, resolved: 0, losses: 0 });
  const stats = [
    { value: statsState.finds, label: "finds" },
    { value: statsState.resolved, label: "resolved" },
    { value: statsState.losses, label: "losses" },
  ];

  // create New Post
  useEffect(() => {
    function onCreated(e) {
      const created = e.detail;
      if (created && (created._id || created.id)) {
        setPosts(prev => [created, ...prev]);

        const t = (created.type || "").toLowerCase();
        if (t === "find") {
          setStatsState(s => ({ ...s, finds: s.finds + 1 }));
        } else if (t === "loss") {
          setStatsState(s => ({ ...s, losses: s.losses + 1 }));
        }
      } else {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        fetch(`${API}/api/posts/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then(r => r.json())
          .then(d => {
            if (Array.isArray(d)) {
              setPosts(d);
              const finds1 = d.filter(p => (p.type || "").toLowerCase() === "find").length;
              const losses1 = d.filter(p => (p.type || "").toLowerCase() === "loss").length;
              setStatsState(s => ({ ...s, finds: finds1, losses: losses1 }));
            }
          })
          .catch(() => {});
      }
    }
    window.addEventListener("post:created", onCreated);
    return () => window.removeEventListener("post:created", onCreated);
  }, []);

  const [resolvingId, setResolvingId] = useState(null);
  const handleResolve = async (postId) => {
    if (!postId) return;
    setResolvingId(postId);

    setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
    setStatsState(s => ({ ...s, resolved: s.resolved + 1 }));

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await fetch(`${API}/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      try {
        const sRes = await fetch(`${API}/api/posts/stats`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const sData = await sRes.json().catch(() => null);
        if (sRes.ok && sData) {
          setStatsState({
            finds: Number(sData.finds ?? 0),
            resolved: Number(sData.resolved ?? 0),
            losses: Number(sData.losses ?? 0),
          });
        }
      } catch {}
    } catch {}
    setResolvingId(null);
  };

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
            imageSrc={p.imageUrl || undefined}
            avatarSrc={activeChar.src}
            avatarBgColorHex={glowColor}
            variant="profile"
            postId={p._id || p.id}
            onResolve={handleResolve}
            resolving={resolvingId === (p._id || p.id)}
          />
        ))}
      </section>
      {showAccSettings && <AccSettings onClose={() => setShowAccSettings(false)} />}
    </div>
  );
}

export default Profile;
