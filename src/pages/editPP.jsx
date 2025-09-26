import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ePP.css";
import { CHARACTERS, COLORS, charById, colorById } from "../lib/avatarCatalog";

// API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Edit Profile Picture Page
function EditPP() {
	const [color, setColor] = useState("blue");
	const [charId, setCharId] = useState("raccoon");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errMsg, setErrMsg] = useState("");

	const navigate = useNavigate();
	const token = localStorage.getItem("token") || sessionStorage.getItem("token");

	useEffect(() => {
		let ignore = false;
		(async () => {
			try {
				setLoading(true);
				setErrMsg("");

				if (!token) {
					setErrMsg("You are not logged in.");
					return;
				}

				const res = await fetch(`${API}/api/profile/me`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				const me = await res.json().catch(() => ({}));
				if (!res.ok) {
					throw new Error(me?.message || `Failed to load profile (${res.status})`);
				}
				if (ignore) return;

				if (me?.avatarCharId) setCharId(me.avatarCharId);
				if (me?.avatarColor) setColor(me.avatarColor);
			} catch (e) {
				if (!ignore) setErrMsg(e.message || "Failed to load profile");
			} finally {
				if (!ignore) setLoading(false);
			}
		})();
		return () => { ignore = true; };
	}, [token]);

	const active = useMemo(() => charById(charId), [charId]);
	const activeColor = useMemo(() => colorById(color), [color]);

	const onSave = async () => {
		try {
			setSaving(true);
			setErrMsg("");

			const res = await fetch(`${API}/api/profile/me/avatar`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ charId, color })
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data?.message || "Failed to save avatar");

			const user = JSON.parse(localStorage.getItem("user") || "null");
			const updated = {
				...(user || {}),
				avatarCharId: data.avatarCharId || charId,
				avatarColor: data.avatarColor || color
			};
			localStorage.setItem("user", JSON.stringify(updated));

			navigate("/editProfile", { replace: true });
		} catch (e) {
			setErrMsg(e.message || "Failed to save avatar");
		} finally {
			setSaving(false);
		}
	};

    // HTML
	return (
		<div className="ePP2">
			<header className="navbar">
				<div className="logo">help n seek</div>
			</header>

			<div className="ePP-container">
				<Link to="/editProfile" className="ePP-back" aria-label="Back">←</Link>

				<section className="ePP-left">
					{errMsg && (
						<div role="alert" className="ePP-alert" style={{ marginBottom: 12 }}>
							{errMsg}
						</div>
					)}

					<div className="ePP-preview" style={{ "--glow": activeColor }}>
						<img
							src={active.src}
							alt={`${active.label} avatar preview`}
							style={{
								transform: `translate(${active.previewX ?? 0}px, ${active.previewY ?? 0}px) scale(${active.previewScale ?? 1})`,
								transformOrigin: "center center"
							}}
						/>
					</div>

					<button
						className="ePP-save"
						onClick={onSave}
						disabled={loading || saving}
						aria-busy={saving ? "true" : "false"}
					>
						{saving ? "Saving..." : "Save"}
					</button>
				</section>

				<aside className="ePP-panel">
					<div className="ePP-panel-inner">
						<div className="ePP-group">
							<div className="ePP-label">Colors:</div>
							<div className="ePP-swatches">
								{Object.entries(COLORS).map(([id, hex]) => (
									<label key={id} className="ePP-paints">
										<input
											type="radio"
											name="color"
											value={id}
											checked={color === id}
											onChange={() => setColor(id)}
										/>
										<span className="dots" style={{ background: hex }}>
											{color === id && <span className="tick">✓</span>}
										</span>
									</label>
								))}
							</div>
						</div>

						<div className="ePP-group">
							<div className="ePP-label">Characters:</div>
							<div className="ePP-grid">
								{Object.values(CHARACTERS).map(ch => (
									<button
										key={ch.id}
										type="button"
										className={`ePP-card ${charId === ch.id ? "is-active" : ""} ${ch.id}`}
										onClick={() => setCharId(ch.id)}
										aria-pressed={charId === ch.id}
										aria-label={`Choose ${ch.label}`}
									>
										<div
											className="ePP-face"
											style={{
												backgroundImage: `url(${ch.src})`,
												backgroundPosition: `${ch.focusX ?? 50}% ${ch.focusY ?? 35}%`,
												backgroundSize: `${(ch.zoom ?? 1.2) * 100}% auto`
											}}
										/>
									</button>
								))}
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}

export default EditPP;

