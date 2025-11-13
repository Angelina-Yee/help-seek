import React, {useState, useEffect, useMemo} from "react";
import { useParams } from "react-router-dom";
import "../styles/profile.css";
import Postcard from "../components/postcard";
import { charById, colorById } from "../lib/avatarCatalog";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function getCurrentUserId() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;
  try {
    const b64 = token.split(".")[1];
    const json = JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    return json.sub || json.userId || json.id || null;
  } catch {
    return null;
  }
}

const toArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  for (const k of ["data", "results", "posts", "list"]) {
    if (Array.isArray(raw?.[k])) return raw[k];
  }
  return [];
};

const getUserId = (p) => {
  const u = p?.user;
  return (
    (u && (u._id || u.id)) ||
    (typeof u === "string" ? u : null) ||
    p?.userId ||
    p?.authorId ||
    null
  );
};

const getImg = (p) => {
  const raw =
    p?.imageUrl ||
    p?.imageURL ||
    p?.image?.url ||
    p?.image ||
    p?.photoUrl ||
    p?.photoURL;
  if (!raw) return undefined;
  return raw[0] === "/" ? `${API}${raw}` : raw;
};

const sameId = (a, b) => a && b && String(a) === String(b);

const AVATAR_OVERRIDE = {
  bunny: { dx: 20, dy: 35, scale: 0.88 },
  cat: { dx: -2, dy: 5, scale: 0.9 },
  chick: { dx: 20, dy: 10, scale: 0.88 },
  chicken: { dx: 20, dy: 23, scale: 0.88 },
  cow: { dx: 20, dy: 10, scale: 0.95 },
  dog: { dx: 20, dy: 0, scale: 0.95 },
  koala: { dx: 20, dy: 10, scale: 0.88 },
  lion: { dx: 19, dy: 25, scale: 0.85 },
  monkey: { dx: 13, dy: 8, scale: 0.85 },
  turtle: { dx: 20, dy: 0, scale: 0.95 },
  pig: { dx: 20, dy: 0, scale: 0.95 },
  raccoon: { dx: 0, dy: 10, scale: 0.9 },
  sheep: { dx: 20, dy: 20, scale: 0.9 },
  tiger: { dx: 8, dy: 5, scale: 0.9 },
};

function Others() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [avatarCharId, setAvatarCharId] = useState("raccoon");
  const [avatarColor, setAvatarColor] = useState("blue");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [stats, setStats] = useState({ finds: 0, resolved: 0, losses: 0 });

  const activeChar = useMemo(
    () => charById(avatarCharId || "raccoon"),
    [avatarCharId]
  );
  const glowColor = useMemo(
    () => colorById(avatarColor || "blue"),
    [avatarColor]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let prof = null;
      try {
        const r = await fetch(`${API}/api/users/${id}`, {
          credentials: "include",
          headers,
        });
        if (r.ok) prof = await r.json().catch(() => null);
      } catch {}
      if (!prof) {
        try {
          const r2 = await fetch(`${API}/api/profile/${id}`, {
            credentials: "include",
            headers,
          });
          if (r2.ok) prof = await r2.json().catch(() => null);
        } catch {}
      }

      if (alive && prof && typeof prof === "object") {
        const displayName =
          (typeof prof.name === "string" && prof.name.trim()) ||
          (typeof prof.displayName === "string" && prof.displayName.trim()) ||
          (prof.email ? String(prof.email).split("@")[0] : "");
        if (displayName) setName(displayName);
        if (prof.avatarCharId) setAvatarCharId(prof.avatarCharId);
        if (prof.avatarColor) setAvatarColor(prof.avatarColor);
      }

      try {
        const blockRes = await fetch(`${API}/api/profile/block-status/${id}`, {
          credentials: "include",
          headers,
        });
        if (blockRes.ok) {
          const blockData = await blockRes.json().catch(() => ({}));
          if (alive) setIsBlocked(blockData.isBlocked || false);
        }
      } catch {}

      try {
        const sr = await fetch(
          `${API}/api/posts/stats?user=${encodeURIComponent(id)}`,
          { credentials: "include", headers }
        );
        if (sr.ok) {
          const sd = await sr.json().catch(() => null);
          if (alive && sd && typeof sd === "object") {
            setStats({
              finds: Number(sd.finds ?? 0) || 0,
              resolved: Number(sd.resolved ?? 0) || 0,
              losses: Number(sd.losses ?? 0) || 0,
            });
          }
        }
      } catch {}

      // Posts of this user
      let mine = [];
      try {
        const pr = await fetch(
          `${API}/api/posts?user=${encodeURIComponent(id)}&includeResolved=1`,
          { credentials: "include", headers }
        );
        if (pr.ok) mine = toArray(await pr.json().catch(() => []));
      } catch {}

      mine = mine.filter((p) => sameId(getUserId(p), id));

      if (alive && mine.length > 0) {
        const u = mine[0]?.user || {};
        const derived =
          (typeof u.name === "string" && u.name.trim()) ||
          (u.email ? String(u.email).split("@")[0] : "");
        if (derived) {
          setName((prev) => prev || derived);
        }
        if (u.avatarCharId) {
          setAvatarCharId(u.avatarCharId);
        }
        if (u.avatarColor) {
          setAvatarColor(u.avatarColor);
        }
      }

      if (alive) {
        setAllPosts(mine);
        setPosts(mine);
      }
      if (alive) setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (isBlocked) {
      setPosts([]);
    } else {
      setPosts(allPosts);
    }
  }, [isBlocked, allPosts]);

  const handleBlockToggle = async () => {
    if (blockLoading) return;
    
    setBlockLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (isBlocked) {
        const res = await fetch(`${API}/api/profile/block/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers,
        });
        
        if (res.ok) {
          setIsBlocked(false);
        } else {
          const error = await res.json().catch(() => ({}));
          alert(error.message || "Failed to unblock user");
        }
      } else {
        const res = await fetch(`${API}/api/profile/block/${id}`, {
          method: "POST",
          credentials: "include",
          headers,
        });
        
        if (res.ok) {
          setIsBlocked(true);
        } else {
          const error = await res.json().catch(() => ({}));
          alert(error.message || "Failed to block user");
        }
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setBlockLoading(false);
    }
  };

  if (loading) return <div className="prof">Loading…</div>;

  const over = AVATAR_OVERRIDE[avatarCharId || "raccoon"] || {};
  const tx = (activeChar.previewX ?? 0) + (over.dx ?? 20);
  const ty = (activeChar.previewY ?? 0) + (over.dy ?? 6);
  const sc = (activeChar.previewScale ?? 1) * (over.scale ?? 0.9);

  const safeName = name || "Friend";
  const firstName = safeName.split(" ")[0];
    
    //HTML
    return(<div className="prof">
        {/*Navbar*/}
        <header className="navbar">
            <div className="logo">help n seek</div>
        </header>

        {/*Hero*/}
        <div className="prof-container">
            <section className="prof-box">
                <h1 className="prof-title">Hello,<br />{safeName}</h1>
                <div className="prof-actions">
                    <button 
                        className="prof-link-third"
                        onClick={handleBlockToggle}
                        disabled={blockLoading}
                    >
                        {blockLoading ? "Loading..." : (isBlocked ? "Unblock" : "Block")}
                    </button>
                </div>
            </section>

            {/*Avatar Stamp*/}
            <aside className="prof-stamp" style={{ "--glow": glowColor}}>
                <div className="stamp-frame">
                    <img 
                        className="racc-img" 
                        src={activeChar.src} alt="Profile avatar"
                        style={{
                            width: "180px",
                            height: "auto",
                            transform: `translate(${tx}px, ${ty}px) scale(${sc})`,
                            transformOrigin: "center center",
                            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.15))",
                            objectFit: "contain", 
                        }}
                    />
                </div>
            </aside>
        </div>

            <div className="prof-stats">
                {[{value:stats.finds,label:"finds"},{value:stats.resolved,label:"resolved"},{value:stats.losses,label:"losses"}].map((s,i)=>(
                    <React.Fragment key={s.label}>
                        <div className="stat">
                            <div className="stat-value">{Number(s.value) || 0}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                        {i < 2 && <div className="stat-divider" />}
                    </React.Fragment>
                ))}
            </div>
        
        {/*Posts*/}
        <section className="prof-posts">
            <div className="posts-header">
                <h3>{firstName}'s posts</h3>
            </div>

            {posts.length === 0 && <div className="empty">No posts yet.</div>}

            {posts.map(p => (
                <Postcard
                    key={p._id || p.id}
                    name={safeName}
                    date={new Date(p.createdAt || Date.now()).toLocaleDateString()}
                    title={p.title}
                    location={p.location}
                    desc={p.description || p.desc}
                    imageSrc= {getImg(p)}
                    avatarSrc={activeChar.src}
                    avatarBgColorHex={glowColor}
                    ownerId={id}
                    currentUserId={getCurrentUserId()}
                    ownerAvatarCharId={avatarCharId}
                    ownerAvatarColor={avatarColor}
                />
            ))}
        </section>
        </div>
    );
}

export default Others;