import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import "../styles/newPost.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function NewPost({ onClose, onBack, postType, initialType }) {
  const dialogRef = useRef(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [typeChoice, setTypeChoice] = useState("");
  const [isIdentifying, setIsIdentifying] = useState(false);

  const normalize = (v) => {
    const x = (v ?? "").toString().trim().toLowerCase();
    return x === "find" || x === "loss" ? x : "";
  };

  useEffect(() => {
    const fromProp = normalize(postType ?? initialType);
    if (fromProp) {
      setTypeChoice(fromProp);
      return;
    }
  }, [postType, initialType]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onBackdrop = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
  };

  useEffect(() => {
    if (!(file instanceof Blob)) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f instanceof File && /^image\//.test(f.type)) {
      setFile(f);
      setError("");
    } else {
      setFile(null);
      setPreview("");
      setError("Please upload a valid image file.");
    }
  };

  const resolveType = () => {
    const fromState = normalize(typeChoice);
    if (fromState) return fromState;

    const fromProps = normalize(postType ?? initialType);
    if (fromProps) return fromProps;

    try {
      const fromSession = normalize(sessionStorage.getItem("newpost.type"));
      if (fromSession) return fromSession;
    } catch {}

    const fromWindow = normalize(typeof window !== "undefined" ? window.__NEWPOST_TYPE : "");
    if (fromWindow) return fromWindow;

    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("You are not logged in.");

      const chosen = resolveType();
      if (!chosen) {
        throw new Error("Please choose Loss or Find first.");
      }
      const form = new FormData();
      if (chosen) form.append("type", chosen);
      form.append("title", title);
      form.append("location", location);
      form.append("objectCategory", category);
      form.append("description", description);
      if (file) form.append("image", file);

      const url = chosen === "find" || chosen === "loss" ? `${API}/api/posts/${chosen}` : `${API}/api/posts`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create post");
      }
      
      // Dispatch event to notify all pages about the new post
      window.dispatchEvent(new CustomEvent("post:created", { 
        detail: data 
      }));
      
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const mapLabelsToCategory = (labels) => {
    if (!labels || labels.length === 0) return "others";

    const categoryKeywords = {
      books: ["book"],
      clothing: [
        "shirt",
        "jacket",
        "clothing",
        "hoodie",
        "sweatshirt",
        "apparel",
      ],
      electronics: [
        "phone",
        "laptop",
        "earbuds",
        "charger",
        "electronic",
        "device",
      ],
      id: ["card", "identification", "license"],
      wallet: ["wallet", "purse", "pouch"],
      "water bottle": ["bottle", "flask", "thermos", "canteen"],
    };

    for (const label of labels) {
      const description = label.description.toLowerCase();
      for (const category in categoryKeywords) {
        if (
          categoryKeywords[category].some((keyword) =>
            description.includes(keyword)
          )
        ) {
          return category;
        }
      }
    }
    return "others";
  };

  const handleAiIdentify = async () => {
    if (!file) {
      setError("Please select an image file first.");
      return;
    }
    setIsIdentifying(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API}/api/vision/identify-item`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("AI analysis failed.");

      const data = await res.json();

      if (data.labels && data.labels.length > 0) {
        const bestGuess = data.labels[0].description;

        setTitle(bestGuess);

        setDescription(bestGuess);

        const bestCategory = mapLabelsToCategory(data.labels);
        setCategory(bestCategory);
      } else {
        setError("AI could not identify the item.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsIdentifying(false);
    }
  };

  return createPortal(
    <div
      className="np-overlay"
      onMouseDown={onBackdrop}
      aria-modal="true"
      role="dialog"
    >
      <div className="np-dialog" ref={dialogRef} role="document">
        <h3 className="np-title">New Post</h3>
        <button className="np-close" onClick={onClose} aria-label="Close">
          X
        </button>
        <form className="np-form" onSubmit={onSubmit}>
          <label className="np-label" htmlFor="np-title">
            Title:
          </label>
          <input
            id="np-title"
            value={title}
            className="np-input"
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="np-duo">
            <div className="np-field">
              <label className="np-label" htmlFor="np-location">
                Location:
              </label>
              <select
                id="np-location"
                value={location}
                className="np-sel"
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="">Pick one...</option>
                <option value="Center Hall">Center Hall</option>
                <option value="Dining Hall">Dining Halls</option>
                <option value="Dorms">Dorms</option>
                <option value="Eighth">Eighth</option>
                <option value="ERC">ERC</option>
                <option value="Geisel">Geisel Library</option>
                <option value="Gym">Gym</option>
                <option value="John Muir">John Muir</option>
                <option value="Mandeville Auditorium">
                  Mandeville Auditorium
                </option>
                <option value="Marshall">Marshall</option>
                <option value="Price Center">Price Center</option>
                <option value="Revelle">Revelle</option>
                <option value="Sally T. WongAvery Library">
                  Sally T. WongAvery Library
                </option>
                <option value="Seventh">Seventh</option>
                <option value="Sixth">Sixth</option>
                <option value="UCSD Restaurants">UCSD Restaurants</option>
                <option value="Warren">Warren</option>
              </select>
            </div>
            <div className="np-field">
              <label className="np-label" htmlFor="np-category">
                Object Category:
              </label>
              <select
                id="np-category"
                value={category}
                className="np-sel"
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Pick one...</option>
                <option value="books">Books</option>
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="id">ID</option>
                <option value="wallet">Wallet</option>
                <option value="water bottle">Water Bottle</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>
          <label className="np-label" htmlFor="np-description">
            Description:
          </label>
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
            <div className="np-media-group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                aria-label="Choose File"
                className="np-input"
                required
              />
              <button
                type="button"
                className="np-ai-btn"
                onClick={handleAiIdentify}
                disabled={!file || isIdentifying}
              >
                {isIdentifying ? "..." : "AI"}
              </button>
            </div>
          </div>
          {error && <div className="np-error">{error}</div>}
          {preview && (
            <div className="np-previewBox" aria-label="Image Preview">
              <img src={preview} alt="preview" />
            </div>
          )}
          <div className="np-actions">
            <button
              type="button"
              className="np-back"
              onClick={onBack}
              disabled={submitting}
            >
              Back
            </button>
            <button type="submit" className="np-submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default NewPost;
