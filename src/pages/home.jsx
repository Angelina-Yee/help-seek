import React, {useRef, useState, useEffect, useMemo} from "react";
import "../styles/home.css";
import HomePostcard from "../components/homePostcard";
import Choice from "../components/choice";
import NewPost from "../components/newPost";
import { Link, useNavigate } from "react-router-dom";
import CategAll from "../components/categAll";
import { listPosts, listThreads } from "../api";
import { charById, colorById } from "../lib/avatarCatalog";
import Notif from "../components/notif";
import { useMessageNotifications } from "../hooks/useMessageNotifications";

//API reqeust URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

//Categories
const categories = ["Books", "Clothing", "Electronics", "ID", "Wallet"];

function useCarousel(){
    const ref= useRef(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(true);

    const update = () => {
        const el = ref.current;
        if(!el) return;
        const {scrollLeft, scrollWidth, clientWidth} = el;
        setCanPrev(scrollLeft>0);
        setCanNext(scrollLeft + clientWidth < scrollWidth -1);
    };

    useEffect(() => {
        update();
        const el = ref.current;
        if(!el) return;
        const onScroll = () => update();
        el.addEventListener("scroll", onScroll, {passive: true});
        window.addEventListener("resize", update);
        return() => {
            el.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", update);
        };
    }, []);

    const scrollByOne = (dir = 1) => {
        const el = ref.current;
        if(!el) return;
        const card = el.querySelector(".postcard");
        const gap = 20;
        const delta = card ? card.offsetWidth + gap : el.clientWidth * 0.9;
        el.scrollBy({ left: dir * delta, behavior: "smooth"});
    };

    return{ ref, canPrev, canNext, next: () => scrollByOne(1), prev: ()=> scrollByOne(-1)};
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

function getAuthorAvatar(p) {
	const u = p?.user || {};
	const char = charById(u.avatarCharId || "raccoon");
	const color = colorById(u.avatarColor || "blue");
	return { avatarSrc: char?.src, avatarBgColorHex: color || "transparent" };
}

function getAuthorName(p) {
	const u = p?.user;
	if (u && typeof u.name === "string" && u.name.trim()) return u.name.trim();
	return "Name";
}

function Home() {
    const [modal, setModal] = useState(null);
    const [showCateg, setShowCateg] = useState(false);
	const navigate = useNavigate();

    const goToCategoryPage = (label) => {
        navigate(`/category?c=${encodeURIComponent(label)}`);
    };

    const [meProfile, setMeProfile] = useState({
		id: getCurrentUserId(),
		name: "",
		avatarCharId: "raccoon",
		avatarColor: "blue",
	});
	const activeChar = useMemo(() => charById(meProfile.avatarCharId), [meProfile.avatarCharId]);
	const glowColor = useMemo(() => colorById(meProfile.avatarColor), [meProfile.avatarColor]);

	// recent lists
	const [lossItems, setLossItems] = useState([]);
	const [findItems, setFindItems] = useState([]);
	const [loadingLoss, setLoadingLoss] = useState(true);
	const [loadingFind, setLoadingFind] = useState(true);

	const losses = useCarousel();
	const finds = useCarousel();

    function useMessageNotifications() {
        const [items, setItems] = useState([]);
        useEffect(() => {
            let mounted = true;
            let timer;
            const fetchOnce = async () => {
                try {
                    const data = await listThreads();
                    const threads = data?.threads || [];
                    const mapped = threads
                        .filter(t => t.unread)
                        .slice(0, 10)
                        .map(t => ({
                            id: t.id,
                            title: "New reply",
                            body: t.lastPreview || "New message",
                            createdAt: t.updatedAt || new Date().toISOString(),
                        }));
                    if (mounted) setItems(mapped);
                } catch {}
            };
            const loop = async () => {
                await fetchOnce();
                timer = setTimeout(loop, 8000);
            };
            loop();
            return () => { mounted = false; if (timer) clearTimeout(timer); };
        }, []);
        return items;
    }

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
					setMeProfile(prev => ({
						id: prev.id || getCurrentUserId(),
						name: data.name || prev.name || "",
						avatarCharId: data.avatarCharId || prev.avatarCharId || "raccoon",
						avatarColor: data.avatarColor || prev.avatarColor || "blue",
					}));
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
				const data = await listPosts({ type: "loss", resolved: false, page: 1, limit: 20 });
				const onlyLoss = (data?.items || [])
					.filter(p => String(p?.type).toLowerCase() === "loss")
					.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
				if (alive) setLossItems(onlyLoss);
			} catch (e) {
				console.error(e);
			} finally {
				if (alive) setLoadingLoss(false);
			}
		})();
		return () => { alive = false; };
	}, []);

    useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const data = await listPosts({ type: "find", resolved: false, page: 1, limit: 20 });
				const onlyFind = (data?.items || [])
					.filter(p => String(p?.type).toLowerCase() === "find")
					.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
				if (alive) setFindItems(onlyFind);
			} catch (e) {
				console.error(e);
			} finally {
				if (alive) setLoadingFind(false);
			}
		})();
		return () => { alive = false; };
	}, []);

    function enrichWithCurrentUser(post) {
		const meId = meProfile.id && String(meProfile.id);

		const rawU = post?.user;
		const postUserId =
			(rawU && (rawU._id || rawU.id)) ||
			(typeof rawU === "string" ? rawU : null) ||
			post.userId ||
			post.authorId ||
			null;

		if (!postUserId || (meId && postUserId && String(postUserId) === meId)) {
			post.user = {
				_id: meId || postUserId,
				id: meId || postUserId,
				name: meProfile.name || "You",
				avatarCharId: meProfile.avatarCharId || "raccoon",
				avatarColor: meProfile.avatarColor || "blue",
			};
		}

		if (!post.createdAt) post.createdAt = new Date().toISOString();
		return post;
	}

    useEffect(() => {
		function onCreated(e) {
			let p = e?.detail;
			if (!p) return;
			p = enrichWithCurrentUser({ ...p });

			const t = String(p.type || "").toLowerCase();
			if (t === "loss") {
				setLossItems(prev => {
					const id = p._id || p.id;
					const exists = prev.some(x => (x._id || x.id) === id);
					const next = exists ? prev : [p, ...prev];
					next.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
					return next;
				});
			} else if (t === "find") {
				setFindItems(prev => {
					const id = p._id || p.id;
					const exists = prev.some(x => (x._id || x.id) === id);
					const next = exists ? prev : [p, ...prev];
					next.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
					return next;
				});
			}
		}
		window.addEventListener("post:created", onCreated);
		return () => window.removeEventListener("post:created", onCreated);
	}, [meProfile]);

    useEffect(() => {
		function onResolved(e) {
			const id = e?.detail?.id;
			if (!id) return;
			setLossItems(prev => prev.filter(x => (x._id || x.id) !== id));
			setFindItems(prev => prev.filter(x => (x._id || x.id) !== id));
		}
		window.addEventListener("post:resolved", onResolved);
		return () => window.removeEventListener("post:resolved", onResolved);
	}, []);

	const meId = meProfile.id && String(meProfile.id);

	const renderRail = (items, type, carousel) => (
		<div className="home-post-container">
			<div className="home-row" ref={carousel.ref}>
				{items.map(p => {
					const postUserId =
						(p?.user && (p.user._id || p.user.id)) ||
						(typeof p?.user === "string" ? p.user : null);
					const href =
						meId && postUserId && String(postUserId) === meId
							? "/profile"
							: postUserId
							? `/users/${postUserId}`
							: "/profile";
					const { avatarSrc, avatarBgColorHex } = getAuthorAvatar(p);

                    return (
                        <HomePostcard
                        className="home-postc"
                        key={p._id || p.id}
                        name={getAuthorName(p)}
                        date={new Date(getTime(p.createdAt)).toLocaleDateString()}
                        imageSrc={p.imageUrl}
                        avatarSrc={avatarSrc}
                        avatarBgColorHex={avatarBgColorHex}
                        profileHref={href}
                        type={type}
                        />
                    );
                })}
            </div>
            <button
                className="home-carousel prev"
                onClick={carousel.prev}
                disabled={!carousel.canPrev}
                aria-label="previoius"
            >
                〈
            </button>
            <button
                className="home-carousel next"
				onClick={carousel.next}
				disabled={!carousel.canNext}
				aria-label="next"
            >
                〉
            </button>
        </div>
    );

    return (
        <div className="home">
            {/*Navbar*/}
            <header className="home-navbar">
                <div className="home-logo">help n seek</div>
                <nav className="home-top">
                    <input placeholder="Search" className="home-searchbar"/>
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
							width: 40,
							height: 40,
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

            {/*Categories*/}
            <div className="home-second">
                <div className="home-categ">
                    {categories.map((c) => (
                        <button 
                            key={c} 
                            className="category" 
                            onClick={() => goToCategoryPage(c)}
                            aria-pressed={false}
                        >
                            {c}
                        </button>
                    ))}
                    <button className="home-all" onClick={() => setShowCateg(true)}>See all</button>
                </div>
                <Notif notifications={useMessageNotifications()} />
            </div>

            {/*Recent Losses*/}
            <section className="home-hero">
                <div className="home-head">
                    <h4>Recent Losses</h4>
                    <Link to="/lossFind" className="home-all">See all</Link>
                </div>
                {loadingLoss ? (
					<div style={{ padding: "8px 0" }}>Loading…</div>
				) : (
					renderRail(lossItems, "loss", losses)
				)}
            </section>

            {/*Recent Finds*/}
            <section className="home-hero">
                <div className="home-head">
                    <h4>Recent Finds</h4>
                    <Link to="/findLoss" className="home-all">See all</Link>
                </div>
                {loadingFind ? (
					<div style={{ padding: "8px 0" }}>Loading…</div>
				) : (
					renderRail(findItems, "find", finds)
				)}
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

export default Home;