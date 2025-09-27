import React, {useState} from "react";
import "../styles/lossFind.css";
import raccoon from "../assets/raccoon.png";
import Postcard from "../components/postcard";
import Choice from "../components/choice";
import NewPost from "../components/newPost";
import CategAll from "../components/categAll";

const lfCategories = ["Books", "Clothing", "Electronics", "ID", "Wallet", "Water Bottle", "Others"];
const categories = ["Books", "Clothing", "Electronics", "ID", "Wallet"];

function Category() {
    const [modal, setModal] = useState(null);
    const [showCateg, setShowCateg] = useState(false);

    //Example loss posts
    const posts= [
            {id: 1, 
            name: "Jane Doe1", 
            date: "Sept 17, 2025",
            title: "Lost Water Bottle", 
            location: "Geisel Library", 
            desc: "Blue stanley..." 
            },
            {id: 2, 
            name: "Jane Doe2", 
            date: "Sept 12, 2025",
            title: "Lost Water Bottle", 
            location: "Geisel Library", 
            desc: "Blue stanley..." 
            },
            {id: 3, 
            name: "Jane Doe3", 
            date: "Sept 10, 2025",
            title: "Lost Water Bottle", 
            location: "Geisel Library", 
            desc: "Blue stanley..." 
            },
            {id: 4, 
            name: "Jane Doe4", 
            date: "Sept 10, 2025",
            title: "Lost Airpods", 
            location: "Geisel Library", 
            desc: "Stickers on it." 
            },
            {id: 5, 
            name: "Jane Doe5", 
            date: "Sept 9, 2025",
            title: "Lost Hoodie", 
            location: "Center Hall", 
            desc: "Black Stussy" 
            },
            {id: 6, 
            name: "Jane Doe6", 
            date: "Sept 4, 2025",
            title: "Lost Student ID", 
            location: "Price Center", 
            desc: "With my name. Please message me." 
            },
    ];

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
                    <button className="pc-avatar" aria-hidden>
                        <img className="ava-img" src={raccoon} alt="Profile avatar"/>
                    </button>
                    
                </div>
            </header>
            {/*Categories*/}
            <div className="home-second">
                <div className="home-categ">
                    {categories.map((c) => (
                        <button key={c} className="category">{c}</button>
                    ))}
                    <button className="home-all" onClick={() => setShowCateg(true)}>See all</button>
                </div>
                <div className="home-notif">
                    <button className="home-noti">🔔</button>
                </div>
            </div>
            {/*Hero*/}
            <section className="lf-hero">
                <div className="lf-container">
                    <div className="lf-row">
                        <div className="lf-header">
                            <h2>Category: "<span></span>"</h2>
                        </div>
                        {posts.map(p => (
                            <Postcard
                            className="postC"
                            key={p.id}
                            name={p.name}
                            date={p.date}
                            title={p.title}
                            location={p.location}
                            desc={p.desc}
                            />
                        ))}
                    </div>
                    <aside className="lf-filter" aria-label="filters">
                        <div className="lf-right">
                            <div className="lf-panel">
                                <div className="lf-title">Sort By</div>
                                <select className="lf-select">
                                    <option>Most Recent</option>
                                    <option>Oldest</option>
                                </select>
                            </div>
                            <div className="lf-panel">
                                <div className="lf-title">Category</div>
                                {lfCategories.map( c=> (
                                    <label key={c} className="lf-check">
                                        <input type="checkbox"/><span>{c}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="lf-panel">
                                <div className="lf-title">Location</div>
                                <select className="lf-select">
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
                                <label className="lf-check"><input type="radio" name="date"/>Last 24 hours</label>
                                <label className="lf-check"><input type="radio" name="date"/>Past Week</label>
                                <label className="lf-check"><input type="radio" name="date"/>Past Month</label>
                            </div>
                            <div className="lf-panel">
                                <div className="lf-title">Status</div>
                                <label className="lf-check"><input type="radio" name="status"/>Lost</label>
                                <label className="lf-check"><input type="radio" name="status"/>Found</label>
                            </div>
                        </div>
                    </aside>
                </div>
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

export default Category;