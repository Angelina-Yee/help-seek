import React, {useState} from "react";
import "../styles/eprofile.css";
import { Link } from "react-router-dom";
import raccoon from "../assets/raccoon.png";

const Colleges= ["Eighth", "ERC", "John Muir", "Marshall", "Revelle", "Sixth", "Seventh", "Warren"];
const Years= ["Freshman", "Sophomore", "Junior", "Senior"];

function EditProfile() {
    const [name] = useState("John Doe");
    const [college, setCollege]= useState("");
    const [year, setYear] = useState("");
    return(<div className="eP">
        {/*Navbar*/}
        <header className="navbar">
            <div className="logo">help n seek</div>
        </header>
        {/*Hero*/}
        <div className="eP-container">
            <h1>Edit Profile</h1>
            <section className="eP-box">
            <div className="eP-header">
                <img src={raccoon} alt="raccoon"/>
                <Link to="/instructions" className="ePP">Edit Profile Picture</Link>
            </div>
            <div className="form-container">
                <div className="row">
                    <label className="label" htmlFor="name">Name:</label>
                    <div id="name" className="name-text">{name}</div>
                </div>
                <div className="row">
                    <label className="label" htmlFor="college">UCSD College:</label>
                    <select id="college" className="select" value={college} onChange={(e)=>setCollege(e.target.value)} required>
                        <option value="" disabled hidden>Select*</option>
                        {Colleges.map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="row">
                    <label className="label" htmlFor="year">Year:</label>
                    <select id="year" className="select" value={year} onChange={(e)=>setYear(e.target.value)} required>
                        <option value="" disabled hidden>Select*</option>
                        {Years.map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            </section>
            <div className="footer">
                <h4>* = required</h4>
                <button type="submit" className="save-btn">save</button>
            </div>
        </div>
        </div>
    );
}

export default EditProfile;