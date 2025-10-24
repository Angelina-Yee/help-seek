import React, {useState, useEffect, useMemo} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/lossFind.css";
import Postcard from "../components/postcard";
import Choice from "../components/choice";
import NewPost from "../components/newPost";
import CategAll from "../components/categAll";
import Notif from "../components/notif";
import SearchBar from "../components/SearchBar";
import { useMessageNotifications } from "../hooks/useMessageNotifications";
import { listPosts } from "../api";
import { charById, colorById } from "../lib/avatarCatalog";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

const lfCategories = ["Books", "Clothing", "Electronics", "ID", "Wallet", "Water Bottle", "Others"];
const categories = ["Books", "Clothing", "Electronics", "ID", "Wallet"];

const norm = (v) => (v ?? "").toString().trim().toLowerCase();
const nospace = (v) => norm(v).replace(/\s+/g, "");

const CANON = {
    "books": "books", "book": "books",
    "clothing": "clothing", "clothes": "clothing",
    "electronics": "electronics", "electronic": "electronics",
    "id": "id", "student id": "id", "studentid": "id",
    "wallet": "wallet",
    "water bottle": "water bottle", "waterbottle": "water bottle", "bottle": "water bottle",
    "others": "others", "other": "others"
}

function toCanonKey(label) {
    const a = norm(label);
    if (CANON[a]) return CANON[a];
    const b = nospace(a);
    if (CANON[b]) return CANON[b];
    return a;
}

function getPostCanonCategory(p) {
    const primary =
        p?.objectCategory ??
        p?.category ??
        p?.categoryName ??
        p?.cat ??
        p?.categ ??
        (Array.isArray(p?.categories) ? p.categories[0] : undefined) ??
        (Array.isArray(p?.tags) ? p.tags[0] : undefined);
  
        if (typeof primary === "number") {
            const label = lfCategories[primary];
            return toCanonKey(label || "");
        }
        if (primary && typeof primary === "object") {
            const maybe = primary.label ?? primary.value ?? primary.name ?? primary.title ?? primary.text ?? primary.id ?? primary.key;
            return toCanonKey(maybe || "");
        }
        if (typeof primary === "string") return toCanonKey(primary);
  
    const pools = [
        Array.isArray(p?.categories) ? p.categories : null,
        Array.isArray(p?.tags) ? p.tags : null
    ].filter(Boolean);
  
    for (const arr of pools) {
        for (const el of arr) {
            if (typeof el === "string") return toCanonKey(el);
            if (typeof el === "number") {
                const label = lfCategories[el];
                return toCanonKey(label || "");
            }
            if (el && typeof el === "object") {
                const maybe = el.label ?? el.value ?? el.name ?? el.title ?? el.text ?? el.id ?? el.key;
                if (maybe) return toCanonKey(maybe);
            }
        }
    }
    return "";
}

function getTime(createdAt) {
    if (!createdAt) return NaN;
    if (typeof createdAt === "string" || typeof createdAt === "number") {
        return new Date(createdAt).getTime();
    }
    const numLong = createdAt?.$date?.$numberLong ?? createdAt?.$numberLong ?? createdAt?.$date;
    if (numLong) return Number(numLong);
    try {
        return new Date(createdAt).getTime();
    } catch {
        return NaN;
    }
}
  
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

function getAuthorName(p) {
    const u = p?.user;
    if (u && typeof u.name === "string" && u.name.trim()) return u.name.trim();
    return undefined;
}
  
function getAuthorAvatar(p) {
    const u = p?.user || {};
    const char = charById(u.avatarCharId || "raccoon");
    const color = colorById(u.avatarColor || "blue");
    return { avatarSrc: char?.src, avatarBgColorHex: color || "transparent" };
}

function Category() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [selectedCat, setSelectedCat] = useState("");

    const [name, setUserName] = useState("");
    const [avatarCharId, setAvatarCharId] = useState("raccoon");
    const [avatarColor, setAvatarColor] = useState("blue");
    const activeChar = useMemo(() => charById(avatarCharId), [avatarCharId]);
    const glowColor = useMemo(() => colorById(avatarColor), [avatarColor]);


    const [modal, setModal] = useState(null);
    const [showCateg, setShowCateg] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [locationFilter, setLocationFilter] = useState("Any Location");
    const [dateFilter, setDateFilter] = useState("any");
    const [sortOrder, setSortOrder] = useState("Most Recent");
    const [statusFilter, setStatusFilter] = useState("all"); 

    useEffect(() => {
        const ui = searchParams.get("c") || "";
        setSelectedCat(ui ? toCanonKey(ui) : "");
    }, [searchParams]);

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                const res = await fetch(`${API}/api/profile/me`, {
                    credentials: "include",
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data) {
                setUserName(data.name || "");
                if (data.avatarCharId) setAvatarCharId(data.avatarCharId);
                if (data.avatarColor) setAvatarColor(data.avatarColor);
            }
          } catch (err) {
            console.error("profile load failed:", err);
          }
        })();
    }, []);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const data = await listPosts({ page: 1, limit: 40 });
                const arr = data?.items || [];
                if (alive) setItems(arr);
              } catch (e) {
                console.error(e);
              } finally {
                if (alive) setLoading(false);
              }
        })();
        return () => { alive = false; };
    }, []);
    
    useEffect(() => {
        function onCreated(e) {
            const p = e?.detail;
            if (!p) return;
            setItems(prev => {
                const id = p._id || p.id;
                const exists = prev.some(x => (x._id || x.id) === id);
                return exists ? prev : [p, ...prev];
            });
        }
        window.addEventListener("post:created", onCreated);
        return () => window.removeEventListener("post:created", onCreated);
    }, []);

    useEffect(() => {
        function onResolved(e) {
            const id = e?.detail?.id;
            if (!id) return;
            setItems(prev => prev.filter(x => (x._id || x.id) !== id));
        }
        window.addEventListener("post:resolved", onResolved);
        return () => window.removeEventListener("post:resolved", onResolved);
    }, []);

    const selectCategory = (uiLabel) => {
        navigate(`/category?c=${encodeURIComponent(uiLabel)}`, { replace: true });
    };

    const visibleItems = useMemo(() => {
        let arr = [...items];
    
        if (selectedCat) {
            arr = arr.filter(p => toCanonKey(getPostCanonCategory(p)) === selectedCat);
        }
    
        if (statusFilter !== "all") {
            arr = arr.filter(p => norm(p?.type) === statusFilter);
        }
    
        if (locationFilter && locationFilter !== "Any Location") {
             arr = arr.filter(p => norm(p?.location) === norm(locationFilter));
        }
    
        if (dateFilter !== "any") {
            const now = Date.now();
            let cutoff = 0;
            if (dateFilter === "24h") cutoff = now - 24 * 60 * 60 * 1000;
            if (dateFilter === "week") cutoff = now - 7 * 24 * 60 * 60 * 1000;
            if (dateFilter === "month") cutoff = now - 30 * 24 * 60 * 60 * 1000;
            arr = arr.filter(p => {
                const t = getTime(p?.createdAt);
                return isFinite(t) && t >= cutoff;
            });
        }
    
        arr.sort((a, b) => {
            const ta = getTime(a?.createdAt);
            const tb = getTime(b?.createdAt);
            return sortOrder === "Oldest" ? ta - tb : tb - ta;
        });
    
        return arr;
      }, [items, selectedCat, statusFilter, locationFilter, dateFilter, sortOrder]);

    const headerLabel = useMemo(() => {
        return selectedCat ? `Category: "${selectedCat}"` : `All Categories`;
    }, [selectedCat]);

    return (
        <div className="home">
            {/*Navbar*/}
            <header className="home-navbar">
                <div className="home-logo">help n seek</div>
                <nav className="home-top">
                    <SearchBar />
                    <button className="home-post" aria-label="create" onClick={() => setModal("choice")}>
                        <span className="new">New Post</span>
                    </button>
                </nav>
                <div className="home-prof">
                    <Link
                        to="/profile"
                        className="pc-avatar"
                        aria-hidden
                        style={{
                            backgroundColor: glowColor || "transparent",
                            borderRadius: "50%",
                            overflow: "hidden",
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            border: "none"
                        }}
                    >
                        <img
                            className="ava-img"
                            src={activeChar.src}
                            alt="Profile avatar"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                objectPosition: "center",
                                transform: "translate(-2.5px, 5px)",
                                display: "block"
                            }}
                        />
                    </Link>
                </div>
            </header>

            {/*Categories*/}
            <div className="home-second">
                <div className="home-categ">
                    {categories.map(c => {
                        const canon = toCanonKey(c);
                        const on = selectedCat === canon;
                        return (
                            <button
                                key={c}
                                className={`category${on ? " is-active" : ""}`}
                                onClick={() => selectCategory(c)}
                                aria-pressed={on}
                            >
                                {c}
                            </button>
                        );
                    })} 
                    <button className="home-all" onClick={() => setShowCateg(true)}>See all</button>
                </div>
                <Notif notifications={useMessageNotifications()} />
            </div>

            {/*Hero*/}
            <section className="lf-hero">
                <div className="lf-container">
                    <div className="lf-row">
                        <div className="lf-header">
                            <h2>{headerLabel}</h2>
                        </div>

                        {loading && <div>Loading…</div>}
                        {!loading && visibleItems.length === 0 && <div>No posts match your filters.</div>}

                        {!loading && visibleItems.map(p => {
                        const me = getCurrentUserId();
                        const postUserId =
                            (p?.user && (p.user._id || p.user.id)) ||
                            (typeof p?.user === "string" ? p.user : null);
                        const href = me && postUserId && String(postUserId) === String(me)
                            ? "/profile"
                            : (postUserId ? `/users/${postUserId}` : "/profile");

                        const authorName = getAuthorName(p);
                        const { avatarSrc, avatarBgColorHex } = getAuthorAvatar(p);

                        return (
                            <Postcard
                            className="postC"
                            key={p._id || p.id}
                            name={authorName}
                            date={new Date(getTime(p.createdAt)).toLocaleDateString()}
                            title={p.title}
                            location={p.location}
                            desc={p.description}
                            imageSrc={p.imageUrl}
                            avatarSrc={avatarSrc}
                            avatarBgColorHex={avatarBgColorHex}
                            profileHref={href}
                            ownerId={postUserId}
                            currentUserId={me}
                            postId={p._id || p.id}
                            ownerAvatarCharId={p?.user?.avatarCharId}
                            ownerAvatarColor={p?.user?.avatarColor}
                            />
                        );
                        })}
                    </div>

                    <aside className="lf-filter" aria-label="filters">
                        <div className="lf-right2">
                            <div className="lf-panel2">
                                <div className="lf-title">Sort By</div>
                                <select 
                                    className="lf-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option>Most Recent</option>
                                    <option>Oldest</option>
                                </select>

                            </div>
                            <div className="lf-panel2">
                                <div className="lf-title">Location</div>
                                <select 
                                    className="lf-select"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                >
                                    <option>Any Location</option>
                                    <option>Center Hall</option>
                                    <option>Dining Halls</option>
                                    <option>Dorms</option>
                                    <option>Eighth</option>
                                    <option>ERC</option>
                                    <option>Geisel Library</option>
                                    <option>Gym</option>
                                    <option>John Muir</option>
                                    <option>Mandeville Auditorium</option>
                                    <option>Marshall</option>
                                    <option>Price Center</option>
                                    <option>Revelle</option>
                                    <option>Sally T. WongAvery Library</option>
                                    <option>Seventh</option>
                                    <option>Sixth</option>
                                    <option>UCSD Restaurants</option>
                                    <option>Warren</option>
                                </select>
                            </div>

                            <div className="lf-panel2">
                                <div className="lf-title">Date Posted</div>
                                <label className="lf-check">
                                    <input 
                                        type="radio" 
                                        name="date"
                                        checked={dateFilter === "any"}
                                        onChange={() => setDateFilter("any")}
                                    /> {" "}
                                    Anytime
                                </label>
                                <label className="lf-check">
                                    <input 
                                        type="radio" 
                                        name="date"
                                        checked={dateFilter === "24h"}
                                        onChange={() => setDateFilter("24h")}
                                    /> {" "}
                                    Last 24 hours
                                </label>
                                <label className="lf-check">
                                    <input 
                                        type="radio" 
                                        name="date"
                                        checked={dateFilter === "week"}
                                        onChange={() => setDateFilter("week")}
                                    /> {" "}
                                    Past Week
                                </label>
                                <label className="lf-check">
                                    <input 
                                        type="radio" 
                                        name="date"
                                        checked={dateFilter === "month"}
                                        onChange={() => setDateFilter("month")}
                                    /> {" "}
                                    Past Month
                                </label>
                            </div>

                            <div className="lf-panel2">
                                <div className="lf-title">Status</div>
                                <label className="lf-check">
                                    <input 
                                        type="radio" 
                                        name="status"
                                        checked={statusFilter === "all"}
                                        onChange={() => setStatusFilter("all")}
                                    />{" "}
                                    Both
                                </label>
                                <label className="lf-check">
                                    <input 
                                        type="radio" 
                                        name="status"
                                        checked={statusFilter === "loss"}
                                        onChange={() => setStatusFilter("loss")}
                                    />{" "}
                                    Lost
                                </label>
                                <label className="lf-check">
                                    <input 
                                        type="radio" 
                                        name="status"
                                        checked={statusFilter === "find"}
                                        onChange={() => setStatusFilter("find")}
                                    />{" "}
                                    Found
                                </label>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {modal === "choice" && (
                <Choice
                    onClose={() => setModal(null)}
                    onPick={() => setModal("newPost")}
                />
            )}
            {modal === "newPost" && (
                <NewPost
                    onClose={() => setModal(null)}
                    onBack={() => setModal("choice")}
                />
            )}
            {showCateg && <CategAll onClose={() => setShowCateg(false)} />}
        </div>
    );
}

export default Category;