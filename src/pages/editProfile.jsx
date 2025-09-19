import React, {useEffect, useState} from "react";
import "../styles/eprofile.css";
import { Link, useNavigate } from "react-router-dom";
import raccoon from "../assets/raccoon.png";

// API request URL
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

const Colleges= ["Eighth", "ERC", "John Muir", "Marshall", "Revelle", "Sixth", "Seventh", "Warren"];
const Years= ["Freshman", "Sophomore", "Junior", "Senior"];

//Edit Profile Page
function EditProfile() {
    const navigate = useNavigate();

    //Form states
    const [name, setName] = useState("Raccoon User");
    const [college, setCollege] = useState("");
    const [year, setYear] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    //Fetch user profile on mount
    useEffect(() => {
        (async () => {
          try {
            const res = await fetch(`${API}/api/profile/me`, {
              method: "GET",
              credentials: "include",
              headers: {
                ...(localStorage.getItem("token")
                  ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
                  : {}),
              },
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load profile");
    
            setName(data.name || "");
            setCollege(data.college || "");
            setYear(data.year || "");
          } catch (e) {
            alert(e.message || "Could not load your profile.");
          } finally {
            setLoading(false);
          }
        })();
      }, []);

      //Save profile changes
      async function onSave(e) {
        e.preventDefault();
        try {
          setSaving(true);
    
          const payload = {
            name: name?.trim() || "",
            college: college || undefined,
            year: year || undefined,
          };
    
          const res = await fetch(`${API}/api/profile/me`, {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(localStorage.getItem("token")
                ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
                : {}),
            },
            body: JSON.stringify(payload),
          });
    
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to update profile");
    
          // Go back to profile page
          navigate("/profile", { replace: true });
        } catch (e) {
          alert(e.message || "Could not save changes.");
        } finally {
          setSaving(false);
        }
      }

    //HTML
    return(<div className="eP">
        {/*Navbar*/}
        <header className="navbar">
            <div className="logo">help n seek</div>
        </header>
        {/*Hero*/}
        <div className="eP-container">
            <Link to="/profile" className="eP-prev" aria-label="Back">
                ←
            </Link>
            <h1>Edit Profile</h1>
            <section className="eP-box">
            <div className="eP-header">
                <div className="eP-preview">
                    <img src={raccoon} alt="raccoon"/>
                </div>
                <Link to="/editPP" className="ePP">Edit Profile Picture</Link>
            </div>
            <div className="form-container">
                <div className="row">
                    <label className="label" htmlFor="name">Name:</label>
                    <div id="name" className="name-text">{name}</div>
                </div>
                <div className="row">
                    <label className="label" htmlFor="college">UCSD College:</label>
                    <select id="college" className="select" value={college} onChange={(e)=>setCollege(e.target.value)} required>
                        <option value="" disabled hidden>Select</option>
                        {Colleges.map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="row">
                    <label className="label" htmlFor="year">Year:</label>
                    <select id="year" className="select" value={year} onChange={(e)=>setYear(e.target.value)} required>
                        <option value="" disabled hidden>Select</option>
                        {Years.map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            </section>
            <div className="footer">
                <button 
                type="button" className="save-btn"
                onClick = {onSave}
                disabled = {saving || loading}
                >
                    {saving ? "saving..." : "save"}
                </button>
            </div>
        </div>
        </div>
    );
}

export default EditProfile;