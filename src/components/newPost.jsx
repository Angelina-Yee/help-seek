import React, {useEffect, useState, useRef} from "react";
import {createPortal} from "react-dom";
import "../styles/newPost.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function normalizeType(t) {
  const v = (t ?? "").toString().trim().toLowerCase();
  return v === "find" || v === "loss" ? v : null;
}

function NewPost({onClose, onBack, postType}) {
    const dialogRef = useRef(null);
    
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    //Prevent background scrolling during popup
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return() => (document.body.style.overflow = prev);
    }, []);

    //Closing the Popup
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const onBackdrop = (e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
    };

    //Preview Images
    useEffect(() => {
        if (!(file instanceof Blob)){
            setPreview("");
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return() => URL.revokeObjectURL(url);
    }, [file]);

    const handleFile = (e) => {
        const f=e.target.files && e.target.files[0];
        if (f instanceof File && /^image\//.test(f.type)){
            setFile(f);
            setError("");
        }else{
            setFile(null);
            setPreview("");
            setError("Please upload a valid image file.");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) throw new Error("You are not logged in.");

            // Normalize directly from prop at submit time (no state race)
            const typeSafe = normalizeType(postType);
            if (!typeSafe) {
              throw new Error("Please choose Loss or Find first.");
            }

            const form = new FormData();
            form.append("type", typeSafe);
            form.append("title", title);
            form.append("location", location);
            form.append("objectCategory", category);
            form.append("description", description);
            if (file) form.append("image", file);

            const res = await fetch(`${API}/api/posts`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const firstMsg = data?.message || data?.errors?.[0]?.msg;
                throw new Error(firstMsg || "Failed to create post");
            }

            // notify Profile to update immediately
            window.dispatchEvent(new CustomEvent("post:created", { detail: data }));
            onClose();
        } catch (err) {
            setError(err.message || "Something went wrong");
            console.error("Create post failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

  return createPortal(
    <div className="np-overlay" onMouseDown={onBackdrop} aria-modal="true" role="dialog">
        <div className="np-dialog" ref={dialogRef} role="document">
            <h3 className="np-title">New Post</h3>
            <button className="np-close" onClick={onClose} aria-label="Close">X</button>
            <div className="np-actions">
                <form className="np-form" onSubmit={onSubmit}>

                    <label className="np-label" htmlFor="np-title">Title:</label>
                    <input
                    id="np-title"
                    value={title}
                    className="np-input"
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    />
                    <div className="np-duo">
                        <div className="np-field">
                        <label className="np-label" htmlFor="np-location">Location:</label>
                        <select id="np-location"
                        value={location}
                        className="np-sel"
                        onChange={(e) => setLocation(e.target.value)}
                        required>
                            <option value="">Pick one...</option>
                            <option value="Center Hall">Center Hall</option>
                            <option value="Dining Halls">Dining Halls</option>
                            <option value="Dorms">Dorms</option>
                            <option value="Eighth">Eighth</option>
                            <option value="ERC">ERC</option>
                            <option value="Geisel Library">Geisel Library</option>
                            <option value="Gym">Gym</option>
                            <option value="John Muir">John Muir</option>
                            <option value="Mandeville Auditorium">Mandeville Auditorium</option>
                            <option value="Marshall">Marshall</option>
                            <option value="Price Center">Price Center</option>
                            <option value="Revelle">Revelle</option>
                            <option value="Sally T. WongAvery Library">Sally T. WongAvery Library</option>
                            <option value="Seventh">Seventh</option>
                            <option value="Sixth">Sixth</option>
                            <option value="UCSD Restaurants">UCSD Restaurants</option>
                            <option value="Warren">Warren</option>
                        </select>
                        </div>
                        <div className="np-field">
                        <label className="np-label" htmlFor="np-title">Object Category:</label>
                        <select id="np-category"
                        value={category}
                        className="np-sel"
                        onChange={(e) => setCategory(e.target.value)}
                        required>
                            <option value="">Pick one...</option>
                            <option value="books">Books</option>
                            <option value="clothing">Clothing</option>
                            <option value="electronics">Electronics</option>
                            <option value="id">ID</option>
                            <option value="wallet">Wallet</option>
                            <option value="water-bottle">Water Bottle</option>
                            <option value="others">Others</option>
                        </select>
                        </div>
                    </div>
                    <label className="np-label" htmlFor="np-description">Description:</label>
                    <textarea
                    id="np-description"
                    rows={6}
                    placeholder="Enter message..."
                    value={description}
                    className="np-textarea"
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    />
                    <label className="np-label">Add Media:</label>
                    <div className="np-media">
                        <input
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        aria-label="Choose File"
                        className="np-input"
                        required
                        />
                    </div>
                    {error && <div className="np-error">{error}</div>}
                    {preview && (
                            <div className="np-previewBox" aria-label="Image Preview">
                                <img src={preview} alt="preview"/>
                            </div>
                    )}

                    <div className="np-actions">
                        <button type="button" className="np-back" onClick={onBack} disabled={submitting}>
                            Back
                        </button>
                        <button type="submit" className="np-submit" disabled={submitting}>
                            {submitting ? "Submitting…" : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>,
    document.body
  );
}

export default NewPost;
