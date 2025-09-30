import React, {useState, useEffect, useMemo} from "react";
import { useParams } from "react-router-dom";
import "../styles/profile.css";
import Postcard from "../components/postcard";
import { charById, colorById } from "../lib/avatarCatalog";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

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
  return (u && (u._id || u.id)) || (typeof u === "string" ? u : null) || p?.userId || p?.authorId || null;
};

const getImg = (p) => {
    const raw = p?.imageUrl || p?.imageURL || p?.image?.url || p?.image || p?.photoUrl || p?.photoURL;
    if (!raw) return undefined;
    return raw[0] === "/" ? `${API}${raw}` : raw;
  };

const sameId = (a, b) => a && b && String(a) === String(b);

function Others() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [avatarCharId, setAvatarCharId] = useState("");
  const [avatarColor, setAvatarColor] = useState("");

  const activeChar = useMemo(() => charById(avatarCharId || "raccoon"), [avatarCharId]);
  const glowColor  = useMemo(() => colorById(avatarColor || "blue"), [avatarColor]);

  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ finds: 0, helped: 0, losses: 0 });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let prof = null;
      try {
        const r = await fetch(`${API}/api/users/${id}`, { credentials: "include", headers });
        if (r.ok) prof = await r.json().catch(() => null);
      } catch {}
      if (!prof) {
        try {
          const r2 = await fetch(`${API}/api/profile/${id}`, { credentials: "include", headers });
          if (r2.ok) prof = await r2.json().catch(() => null);
        } catch {}
      }
      if (alive && prof) {
        const displayName =
          (typeof prof.name === "string" && prof.name.trim()) ||
          (typeof prof.displayName === "string" && prof.displayName.trim()) ||
          (prof.email ? String(prof.email).split("@")[0] : "");
        if (displayName) setName(displayName);
        if (prof.avatarCharId) setAvatarCharId(prof.avatarCharId);
        if (prof.avatarColor) setAvatarColor(prof.avatarColor);
      }

      let mine = [];
      try {
        const pr = await fetch(
          `${API}/api/posts?user=${encodeURIComponent(id)}&includeResolved=1`,
          { credentials: "include", headers }
        );
        if (pr.ok) mine = toArray(await pr.json().catch(() => []));
        else {
          const pr2 = await fetch(`${API}/api/users/${id}/posts?includeResolved=1`, {
            credentials: "include",
            headers,
          });
          if (pr2.ok) mine = toArray(await pr2.json().catch(() => []));
        }
      } catch {}

      mine = mine.filter((p) => sameId(getUserId(p), id));
      if (alive) setPosts(mine);

      if (alive && mine.length > 0) {
        const u = mine[0]?.user || {};
        if (!name) {
          const derived =
            (typeof u.name === "string" && u.name.trim()) ||
            (u.email ? String(u.email).split("@")[0] : "");
          if (derived) setName(derived);
        }
        if (!avatarCharId && u.avatarCharId) setAvatarCharId(u.avatarCharId);
        if (!avatarColor && u.avatarColor) setAvatarColor(u.avatarColor);
      }

      const finds  = mine.filter((p) => String(p?.type).toLowerCase() === "find").length;
      const losses = mine.filter((p) => String(p?.type).toLowerCase() === "loss").length;
      const helped = mine.filter((p) => p?.resolved === true || String(p?.status).toLowerCase() === "resolved").length;
      if (alive) setStats({ finds, helped, losses });

      if (alive) setLoading(false);
    })();

    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="prof">Loading…</div>;

  const OVERRIDE = {
    bunny:{dx:20,dy:35,scale:0.88}, cat:{dx:-2,dy:5,scale:0.9}, chick:{dx:20,dy:10,scale:0.88},
    chicken:{dx:20,dy:23,scale:0.88}, cow:{dx:20,dy:10,scale:0.95}, dog:{dx:20,dy:0,scale:0.95},
    koala:{dx:20,dy:10,scale:0.88}, lion:{dx:19,dy:25,scale:0.85}, monkey:{dx:13,dy:8,scale:0.85},
    turtle:{dx:20,dy:0,scale:0.95}, pig:{dx:20,dy:0,scale:0.95}, raccoon:{dx:0,dy:10,scale:0.9},
    sheep:{dx:20,dy:20,scale:0.9}, tiger:{dx:8,dy:5,scale:0.9},
  };
  const over = OVERRIDE[avatarCharId || "raccoon"] || {};
  const tx = (activeChar.previewX ?? 0) + (over.dx ?? 20);
  const ty = (activeChar.previewY ?? 0) + (over.dy ?? 6);
  const sc = (activeChar.previewScale ?? 1) * (over.scale ?? 0.9);

  const safeName  = name || "Friend";
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
                    <button className="prof-link-third">
                        Block
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
               {[{value:stats.finds,label:"finds"},{value:stats.helped,label:"helped"},{value:stats.losses,label:"losses"}].map((s,i)=>(
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
                />
            ))}
        </section>
        </div>
    );
}

export default Others;