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

// Categories for filtering
const LF_CATEGORIES = ["Books", "Clothing", "Electronics", "ID", "Wallet", "Water Bottle", "Others"];
const QUICK_CATEGORIES = ["Books", "Clothing", "Electronics", "ID", "Wallet"];

// decode current user id from JWT (sub | userId | id)
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

// Loss Page
function LossFind() {
	const [name, setUserName] = useState("");
	const [avatarCharId, setAvatarCharId] = useState("raccoon");
	const [avatarColor, setAvatarColor] = useState("blue");

	const activeChar = useMemo(() => charById(avatarCharId), [avatarCharId]);
	const glowColor = useMemo(() => colorById(avatarColor), [avatarColor]);

	const [modal, setModal] = useState(null);
	const [showCateg, setShowCateg] = useState(false);
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	// Load profile
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

	// Load LOSS posts
	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const data = await listPosts({ type: "loss", resolved: false, page: 1, limit: 20 });
				const onlyLoss = (data?.items || []).filter(p => p?.type === "loss");
				if (alive) setItems(onlyLoss);
			} catch (e) {
				console.error(e);
			} finally {
				if (alive) setLoading(false);
			}
		})();
		return () => { alive = false; };
	}, []);

	return (
		<div className="home">
			{/* Navbar */}
			<header className="home-navbar">
                <div className="home-logo">help n seek</div>

				<nav className="home-top">
					<input placeholder="Search" className="home-searchbar" />
					<button className="home-search" aria-label="search">⌕</button>
					<button
						className="home-post"
						aria-label="create"
						onClick={() => setModal("choice")}
					>
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

			<div className="home-second">
				<div className="home-categ">
					{QUICK_CATEGORIES.map(c => (
						<button key={c} className="category">{c}</button>
					))}
					<button className="home-all" onClick={() => setShowCateg(true)}>See all</button>
				</div>
				<div className="home-notif">
					<button className="home-noti" aria-label="notifications">🔔</button>
				</div>
			</div>

			<section className="lf-hero">
				<div className="lf-header">
					<h2>Losses</h2>
				</div>

				<div className="lf-container">
					<div className="lf-row">
						{loading && <div>Loading…</div>}
						{!loading && items.length === 0 && <div>No active loss posts yet.</div>}

						{!loading && items.map(p => {
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
									date={new Date(p.createdAt).toLocaleDateString()}
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
							<div className="lf-panel">
								<div className="lf-title">Sort By</div>
								<select className="lf-select" defaultValue="Most Recent">
									<option>Most Recent</option>
									<option>Oldest</option>
								</select>
							</div>

							<div className="lf-panel">
								<div className="lf-title">Category</div>
								{LF_CATEGORIES.map(c => (
									<label key={c} className="lf-check">
										<input type="checkbox" /> <span>{c}</span>
									</label>
								))}
							</div>

							<div className="lf-panel">
								<div className="lf-title">Location</div>
								<select className="lf-select" defaultValue="Any Location">
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

							<div className="lf-panel">
								<div className="lf-title">Date Posted</div>
								<label className="lf-check"><input type="radio" name="date" /> Last 24 hours</label>
								<label className="lf-check"><input type="radio" name="date" /> Past Week</label>
								<label className="lf-check"><input type="radio" name="date" /> Past Month</label>
							</div>

							<div className="lf-panel">
								<div className="lf-title">Status</div>
								<label className="lf-check"><input type="radio" name="status" defaultChecked /> Lost</label>
								<label className="lf-check"><input type="radio" name="status" disabled /> Found</label>
							</div>
						</div>
					</aside>
				</div>
			</section>

			{modal === "choice" && (
				<Choice onClose={() => setModal(null)} onPick={() => setModal("newPost")} />
			)}
			{modal === "newPost" && (
				<NewPost onClose={() => setModal(null)} onBack={() => setModal("choice")} />
			)}
			{showCateg && <CategAll onClose={() => setShowCateg(false)} />}
		</div>
	);
}

export default LossFind;