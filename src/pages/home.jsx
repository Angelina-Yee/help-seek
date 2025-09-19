import React, {useRef, useState, useEffect} from "react";
import "../styles/home.css";
import raccoon from "../assets/raccoon.png";
import HomePostcard from "../components/homePostcard";

const categories = ["Airpods", "Student ID", "Wallet", "Water Bottle"];

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

function Home() {
    //Example loss posts
    const posts= [
            {id: 1, 
            name: "Jane Doe1", 
            date: "Sept 17, 2025"
            },
            {id: 2, 
            name: "Jane Doe2", 
            date: "Sept 12, 2025"
            },
            {id: 3, 
            name: "Jane Doe3", 
            date: "Sept 10, 2025"
            },
            {id: 4, 
            name: "Jane Doe4", 
            date: "Sept 10, 2025"
            },
            {id: 5, 
            name: "Jane Doe5", 
            date: "Sept 9, 2025"
            },
            {id: 6, 
            name: "Jane Doe6", 
            date: "Sept 4, 2025"
            },
    ];

    const findposts= [
            {id: 1, 
            name: "John Doe", 
            date: "Sept 16, 2025"
            },
            {id: 2, 
            name: "Jane Doe1", 
            date: "Sept 10, 2025"
            },
            {id: 3, 
            name: "Jane Doe2", 
            date: "Sept 10, 2025"
            },
            {id: 4, 
            name: "Jane Doe3", 
            date: "Sept 9, 2025"
            },
            {id: 5, 
            name: "Jane Doe4", 
            date: "Sept 2, 2025"
            },
            {id: 6, 
            name: "Jane Doe5", 
            date: "Aug 28, 2025"
            },
    ];

    const losses= useCarousel();
    const finds = useCarousel();

    return (
        <div className="home">
            {/*Navbar*/}
            <header className="home-navbar">
                <div className="home-logo">help n seek</div>
                <nav className="home-top">
                    <input placeholder="Search" className="home-searchbar"/>
                    <button className="home-search" aria-label="search">⌕</button>
                    <button className="home-post" aria-label="create">
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
                    <button className="home-all">See all</button>
                </div>
                <div className="home-notif">
                    <button className="home-noti">🔔</button>
                </div>
            </div>
            {/*Recent Losses*/}
            <section className="home-hero">
                <div className="home-head">
                    <h4>Recent Losses</h4>
                    <button className="home-all">See all</button>
                </div>
                <div className="home-post-container">
                    <div className="home-row" ref={losses.ref}>
                        {posts.map(p => (
                            <HomePostcard
                            className="home-postc"
                            key={p.id}
                            name={p.name}
                            date={p.date}
                            />
                        ))}
                    </div>
                    <button className="home-carousel prev" onClick={losses.prev} disabled={!losses.canPrev} aria-label="previous">〈</button>
                    <button className="home-carousel next" onClick={losses.next} disabled={!losses.canNext} aria-label="next">〉</button>
                </div>
            </section>

            {/*Recent Finds*/}
            <section className="home-hero">
                <div className="home-head">
                    <h4>Recent Finds</h4>
                    <button className="home-all">See all</button>
                </div>
                <div className="home-post-container">
                    <div className="home-row" ref={finds.ref}>
                        {findposts.map(p => (
                            <HomePostcard
                            className="home-postc"
                            key={p.id}
                            name={p.name}
                            date={p.date}
                            />
                        ))}
                    </div>
                    <button className="home-carousel prev" onClick={finds.prev} disabled={!finds.canPrev} aria-label="previous">〈</button>
                    <button className="home-carousel next" onClick={finds.next} disabled={!finds.canNext} aria-label="next">〉</button>
                </div>
            </section>
        </div>
    );
}

export default Home;