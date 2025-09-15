import React, {useState} from "react";
import "../styles/profile.css";
import { Link } from "react-router-dom";
import raccoon from "../assets/raccoon.png";

function Profile() {
    const stats = [
        {value: 1, label: "finds"},
        {value: 10, label: "helped"},
        {value: 0, label: "losses"},
    ];
    const posts= [
        {id: 1, name: "Water bottle near Geisel", status: "resolved",  date: "2025-09-10"},
    ]
    return(<div className="prof">
        {/*Navbar*/}
        <header className="navbar">
            <div className="logo">help n seek</div>
        </header>
        {/*Hero*/}
        <div className="prof-container">
            <section className="prof-box">
                <h1 className="prof-title">Hello,<br />John Doe</h1>
                <div className="prof-actions">
                    <Link to="/editProfile" className="prof-link">Edit Profile</Link>
                    <Link to="/instructions" className="prof-link">Settings</Link>
                </div>

                {/*Stats*/}
                <div className="prof-stats">
                    {stats.map((s, i) => (
                        <React.Fragment key={i}>
                            <div className="stat" key={i}>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                            {i < stats.length -1 && <div className="stat-divider" />}
                        </React.Fragment>
                    ))}
                </div>
            </section>
            {/*Avatar Stamp*/}
            <aside className="prof-stamp">
                <div className="stamp-frame">
                    <img src={raccoon} alt="Profile avatar"/>
                </div>
            </aside>
        </div>
        <section className="prof-posts">
            <div className="posts-header">
                <h3>Your Posts</h3>
                <button className="filter-btn" aria-label="Filter posts">▾</button>
            </div>

            <div className="posts-table">
                <div className="posts-row posts-head">
                    <div className="cell icon" title="type">☺︎</div>
                    <div className="cell name">Name</div>
                    <div className= "cell status">Status</div>
                    <div className="cell date">Date</div>
                </div>
                {posts.map(p => (
                    <div className="posts-row" key={p.id}>
                        <div className="cell name">{p.name}</div>
                        <div className={`cell status ${p.status}`}>{p.status}</div>
                        <div className="cell date">{p.date}</div>
                    </div>
                ))}
            </div>
        </section>
        </div>
    );
}

export default Profile;