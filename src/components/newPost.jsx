import React, {useEffect, useState, useRef} from "react";
import {createPortal} from "react-dom";
import "../styles/newPost.css";

function NewPost({onClose, onBack}) {
    const dialogRef = useRef(null);
    
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");

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

    const onSubmit = (e) => {
        e.preventDefault();
        console.log({title, location, description, file});
        onClose();
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
                            <option value="centerHall">Center Hall</option>
                            <option value="diningHall">Dining Halls</option>
                            <option value="dorms">Dorms</option>
                            <option value="eighth">Eighth</option>
                            <option value="erc">ERC</option>
                            <option value="geisel">Geisel Library</option>
                            <option value="gym">Gym</option>
                            <option value="muir">John Muir</option>
                            <option value="mandeville">Mandeville Auditorium</option>
                            <option value="marshall">Marshall</option>
                            <option value="price">Price Center</option>
                            <option value="revelle">Revelle</option>
                            <option value="wongavery">Sally T. WongAvery Library</option>
                            <option value="seventh">Seventh</option>
                            <option value="sixth">Sixth</option>
                            <option value="restaurants">UCSD Restaurants</option>
                            <option value="warren">Warren</option>
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
                        <button type="button" className="np-back" onClick={onBack}>
                            Back
                        </button>
                        <button type="submit" className="np-submit">
                            Submit
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