import React, {useState, useEffect} from "react";
import "../styles/profile.css";
import { Link } from "react-router-dom";
import raccoon from "../assets/raccoon.png";
import Postcard from "../components/postcard";

function Others() {
    //State to hold user's display name 
    const [userName, setUserName] = useState("...");

    //Fetch profile data on mount MUST CHANGE
    useEffect(() => {
        const abort = new AbortController();

        (async () => {
          try {
            const res = await fetch("http://localhost:4000/api/profile/me", {
              method: "GET",
              credentials: "include",
              headers: {
                ...(localStorage.getItem("token")
                  ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
                  : {}),
              },
              signal: abort.signal,
            });

            //Prefer user name, fall back to email prefix or "Friend"
            if (!res.ok) throw new Error("profile fetch failed");
            const data = await res.json();
      
            setUserName(data.name || (data.email ? data.email.split("@")[0] : "Friend"));

          } catch (e) {
            console.error(e);
            setUserName("Friend");
          }
        })();

        return () => abort.abort();
    }, []);

    //Placeholder stats
    const stats = [
        {value: 0, label: "finds"},
        {value: 5, label: "helped"},
        {value: 1, label: "losses"},
    ];

    //Example posts
    const posts= [
            {id: 1, 
            name: "Jane Doe", 
            title:"Lost Water Bottle",
            location: "Geisel Library",
            desc: "Blue stanley water bottle with pink stickers. Lost near the first floor computer area.",
        },
    ];

    //HTML
    return(<div className="prof">
        {/*Navbar*/}
        <header className="navbar">
            <div className="logo">help n seek</div>
        </header>
        {/*Hero*/}
        <div className="prof-container">
            <section className="prof-box">
                <h1 className="prof-title">Hello,<br />I'm Jane Doe</h1>
                <div className="prof-actions">
                    <button className="prof-link-third">
                        Block
                    </button>
                </div>
            </section>

            {/*Avatar Stamp*/}
            <aside className="prof-stamp">
                <div className="stamp-frame">
                    <img className="racc-img" src={raccoon} alt="Profile avatar"/>
                </div>
            </aside>
        </div>

            
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
        
        {/*Posts*/}
        <section className="prof-posts">
            <div className="posts-header">
                <h3>Your posts</h3>
            </div>

            {posts.map(p => (
                <Postcard
                key={p.id}
                name={p.name}
                date={p.date}
                title={p.title}
                location={p.location}
                desc={p.desc}
                />
            ))}
        </section>
        </div>
    );
}

export default Others;