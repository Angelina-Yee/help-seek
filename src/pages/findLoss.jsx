import React, { useEffect, useMemo, useState } from "react";
import "../styles/lossFind.css";
import Postcard from "../components/postcard";
import Choice from "../components/choice";
import NewPost from "../components/newPost";
import CategAll from "../components/categAll";
import { listPosts } from "../api";
import { Link } from "react-router-dom"; 
import { charById, colorById } from "../lib/avatarCatalog";

// API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

// UI category labels
const LF_CATEGORIES = ["Books", "Clothing", "Electronics", "ID", "Wallet", "Water Bottle", "Others"];
const QUICK_CATEGORIES = ["Books", "Clothing", "Electronics", "ID", "Wallet"];

// Decode current userid
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
};

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
		const label = LF_CATEGORIES[primary];
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
				const label = LF_CATEGORIES[el];
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

// Find Page
function FindLoss() {
	const [name, setUserName] = useState("");
	const [avatarCharId, setAvatarCharId] = useState("raccoon");
	const [avatarColor, setAvatarColor] = useState("blue");

	const activeChar = useMemo(() => charById(avatarCharId), [avatarCharId]);
	const glowColor = useMemo(() => colorById(avatarColor), [avatarColor]);

	const [modal, setModal] = useState(null);
	const [showCateg, setShowCateg] = useState(false);
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	// FILTER STATE
	const [selectedCats, setSelectedCats] = useState(new Set());
	const [locationFilter, setLocationFilter] = useState("Any Location");
	const [dateFilter, setDateFilter] = useState("any");
	const [sortOrder, setSortOrder] = useState("Most Recent");

	// User profile fetch
	useEffect(() => {
		(async () => {
			try {
				const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
			} catch (err) {
				console.error("profile load failed:", err);
			}
		})();
	}, []);

	// Load FIND posts only
	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const data = await listPosts({ type: "find", resolved: false, page: 1, limit: 20 });
				const onlyFind = (data?.items || []).filter(p => norm(p?.type) === "find");
				if (alive) setItems(onlyFind);
			} catch (e) {
				console.error(e);
			} finally {
				if (alive) setLoading(false);
			}
		})();
		return () => { alive = false; };
	}, []);

	// Add new post
	useEffect(() => {
		function onCreated(e) {
			const p = e?.detail;
			if (!p || norm(p.type) !== "find") return;
			setItems(prev => {
				const id = p._id || p.id;
				const exists = prev.some(x => (x._id || x.id) === id);
				return exists ? prev : [p, ...prev];
			});
		}
		window.addEventListener("post:created", onCreated);
		return () => window.removeEventListener("post:created", onCreated);
	}, []);

	// Delete Resolved Posts
	useEffect(() => {
		function onResolved(e) {
			const id = e?.detail?.id;
			if (!id) return;
			setItems(prev => prev.filter(x => (x._id || x.id) !== id));
		}
		window.addEventListener("post:resolved", onResolved);
		return () => window.removeEventListener("post:resolved", onResolved);
	}, []);

	// Filter and sort items
	const visibleItems = useMemo(() => {
		let arr = [...items];

		// Category filter
		if (selectedCats.size > 0) {
			arr = arr.filter(p => selectedCats.has(getPostCanonCategory(p)));
		}

		// Location filter
		if (locationFilter && locationFilter !== "Any Location") {
			arr = arr.filter(p => norm(p?.location) === norm(locationFilter));
		}

		// Date posted filter
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

		// Sort
		arr.sort((a, b) => {
			const ta = getTime(a?.createdAt);
			const tb = getTime(b?.createdAt);
			return sortOrder === "Oldest" ? ta - tb : tb - ta;
		});

		return arr;
	}, [items, selectedCats, locationFilter, dateFilter, sortOrder]);

	// UI handlers
	const toggleCategory = (uiLabel) => {
		const canon = toCanonKey(uiLabel);
		setSelectedCats(prev => {
			const next = new Set(prev);
			if (next.has(canon)) next.delete(canon);
			else next.add(canon);
			return next;
		});
	};

	const quickPick = (uiLabel) => {
		toggleCategory(uiLabel);
	};

	// HTML
	return (
		<div className="home">
			{/* Navbar */}
			<header className="home-navbar">
				<div className="home-logo">help n seek</div>
				<nav className="home-top">
					<input placeholder="Search" className="home-searchbar" />
					<button className="home-search" aria-label="search">⌕</button>
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
							width: 36,
							height: 36,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: 0,
							border: "none",
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
								transform: "translate(-2.7px, 6px)",
								display: "block",
							}}
						/>
					</Link>
				</div>
			</header>

			{/* Categories (quick toggles) */}
			<div className="home-second">
				<div className="home-categ">
					{QUICK_CATEGORIES.map(c => {
						const cCanon = toCanonKey(c);
						return (
							<button
								key={c}
								className={`category${selectedCats.has(cCanon) ? " is-active" : ""}`}
								onClick={() => quickPick(c)}
								aria-pressed={selectedCats.has(cCanon)}
							>
								{c}
							</button>
						);
					})}
					<button className="home-all" onClick={() => setShowCateg(true)}>See all</button>
				</div>
				<div className="home-notif">
					<button className="home-noti" aria-label="notifications">🔔</button>
				</div>
			</div>

			<section className="lf-hero">
				<div className="lf-header">
					<h2>Finds</h2>
				</div>
				<div className="lf-container">
					<div className="lf-row">
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

							return (
								<Postcard
									className="postC"
									key={p._id}
									name={name}
									date={new Date(getTime(p.createdAt)).toLocaleDateString()}
									title={p.title}
									location={p.location}
									desc={p.description}
									imageSrc={p.imageUrl}
									avatarSrc={activeChar.src}
									avatarBgColorHex={glowColor}
									profileHref={href}
								/>
							);
						})}
					</div>

					<aside className="lf-filter" aria-label="filters">
						<div className="lf-right">
							{/* Sort */}
							<div className="lf-panel">
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

							{/* Category */}
							<div className="lf-panel">
								<div className="lf-title">Category</div>
								{LF_CATEGORIES.map(c => {
									const cCanon = toCanonKey(c);
									return (
										<label key={c} className="lf-check">
											<input
												type="checkbox"
												checked={selectedCats.has(cCanon)}
												onChange={() => toggleCategory(c)}
											/>{" "}
											<span>{c}</span>
										</label>
									);
								})}
							</div>

							{/* Location */}
							<div className="lf-panel">
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

							{/* Date Posted */}
							<div className="lf-panel">
								<div className="lf-title">Date Posted</div>
								<label className="lf-check">
									<input
										type="radio"
										name="date"
										checked={dateFilter === "any"}
										onChange={() => setDateFilter("any")}
									/>{" "}
									Any time
								</label>
								<label className="lf-check">
									<input
										type="radio"
										name="date"
										checked={dateFilter === "24h"}
										onChange={() => setDateFilter("24h")}
									/>{" "}
									Last 24 hours
								</label>
								<label className="lf-check">
									<input
										type="radio"
										name="date"
										checked={dateFilter === "week"}
										onChange={() => setDateFilter("week")}
									/>{" "}
									Past Week
								</label>
								<label className="lf-check">
									<input
										type="radio"
										name="date"
										checked={dateFilter === "month"}
										onChange={() => setDateFilter("month")}
									/>{" "}
									Past Month
								</label>
							</div>
						</div>
					</aside>
				</div>
			</section>

			{modal === "choice" && <Choice onClose={() => setModal(null)} onPick={() => setModal("newPost")} />}
			{modal === "newPost" && <NewPost onClose={() => setModal(null)} onBack={() => setModal("choice")} />}
			{showCateg && <CategAll onClose={() => setShowCateg(false)} />}
		</div>
	);
}

export default FindLoss;