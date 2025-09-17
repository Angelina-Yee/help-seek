import React, {useState, useMemo} from "react";
import {Link} from "react-router-dom";
import "../styles/ePP.css";
import raccoon from "../assets/raccoon.png";
import bear from "../assets/bear.png";
import bunny from "../assets/bunny.png";
import cat from "../assets/cat.png";
import chick from "../assets/chick.png";
import chicken from "../assets/chicken.png";
import cow from "../assets/cow.png";
import dog from "../assets/dog.png";
import goat from "../assets/goat.png";
import koala from "../assets/koala.png";
import lion from "../assets/lion.png";
import monkey from "../assets/monkey.png";
import pig from "../assets/pig.png";
import sheep from "../assets/sheep.png";
import tiger from "../assets/tiger.png";
import turtle from "../assets/turtle.png";

const Characters=[
    {id: "bear", label: "Bear", src: bear, focusX: 50, focusY: -10, zoom: 0.95,
        previewScale: 0.84, previewX: -20, previewY: -6,
    }, 
    {id: "bunny", label: "Bunny", src: bunny, focusX: 50, focusY: 40, zoom: 0.95,
        previewScale: 0.75, previewX: -20, previewY: -37,
    },
    {id: "cat", label: "Cat", src: cat, focusX: -30, focusY: -8, zoom: 1.1,
        previewScale: 0.93, previewX: 3, previewY: 0,
    },
    {id: "chick", label: "Chick", src: chick, focusX: 50, focusY: 15, zoom: 0.9,
        previewScale: 0.75, previewX: -20, previewY: -13,
    },
    {id: "chicken", label: "Chicken", src: chicken, focusX: 50, focusY: 23, zoom: 0.9,
        previewScale: 0.75, previewX: -20, previewY: -25,
    },
    {id: "cow", label: "Cow", src: cow, focusX: 50, focusY: 0, zoom: 0.93,
        previewScale: 0.83, previewX: -20, previewY: -11,
    },
    {id: "dog", label: "Dog", src: dog, focusX: 50, focusY: -3, zoom: 0.98,
        previewScale: 0.78, previewX: -20, previewY: 2,
    },
    {id: "goat", label: "Goat", src: goat, focusX: 50, focusY: -5, zoom: 0.99,
        previewScale: 0.86, previewX: -20, previewY: -7,
    }, 
    {id: "koala", label: "Koala", src: koala, focusX: 50, focusY: 0, zoom: 1.6,
        previewScale: 1.3, previewX: -20, previewY: 2,
    },
    {id: "lion", label: "Lion", src: lion, focusX: 50, focusY: 0, zoom: 1.08,
        previewScale: 1.1, previewX: -20, previewY: -24,
    },
    {id: "monkey", label: "Monkey", src: monkey, focusX: 50, focusY: 17, zoom: 1.3,
        previewScale: 1.1, previewX: -15, previewY: 3,
    },
    {id: "turtle", label: "Turtle", src: turtle, focusX: 50, focusY: -5, zoom: 0.95,
        previewScale: 0.76, previewX: -20, previewY: 5,
    },
    {id: "pig", label: "Pig", src: pig, focusX: 50, focusY: -15, zoom: 0.95,
        previewScale: 0.8, previewX: -20, previewY: 5,
    },
    {id: "raccoon", label: "Raccoon", src: raccoon, focusX: -18, focusY: -20, zoom: 1.1,
        previewScale: 1, previewX: 0, previewY: 0,
    },
    {id: "sheep", label: "Sheep", src: sheep, focusX: 50, focusY: 24, zoom: 1,
        previewScale: 0.8, previewX: -20, previewY: -22,
    },
    {id: "tiger", label: "Tiger", src: tiger, focusX: 25, focusY: -8, zoom: 1.2,
        previewScale: 0.99, previewX: -8, previewY: 3,
    },
];

const  Colors=[
    {id: "blue", hex: "#0F348F"}, 
    {id: "yellow", hex: "#FFCD00"},
    {id: "orange", hex: "#FF7700"},
    {id: "pink", hex: "#E34680"},
    {id: "mint", hex: "#8BBD0C"},
];

function EditPP() {
    const [color, setColor] = useState("blue");
    const [charId, setCharId] = useState("raccoon");
    const active = useMemo(() => Characters.find(c => c.id === charId) || Characters[0], [charId]);
    const activeColor = useMemo(() => Colors.find(c=>c.id === color) ?.hex ?? "#0F348F", [color]);

  return (
    <div className="ePP2">
      {/*Navbar*/}
        <header className="navbar">
            <div className="logo">help n seek</div>
        </header>
        <div className="ePP-container">
            <Link to="/editProfile" className="ePP-back" aria-label="Back">
                ←
            </Link>

            <section className="ePP-left">
                <div className="ePP-preview" style={{"--glow" : activeColor}}>
                    <img src={active.src} alt="Avatar Preview"
                    style={{transform: `translate(${active?.previewX?? 0}px, ${active?.previewY ?? 0}px) scale(${active?.previewScale ?? 1})`,
                    transformOrigin: "center center"}}/>
                </div>
                <button className="ePP-save">Save</button>
            </section>

            <aside className="ePP-panel">
                <div className="ePP-panel-inner">
                    <div className="ePP-group">
                        <div className="ePP-label">Colors:</div>
                        <div className="ePP-swatches">
                            {Colors.map(c=> (
                                <label key={c.id} className="ePP-paints">
                                    <input
                                        type="radio"
                                        name="color"
                                        value={c.id}
                                        checked={color === c.id}
                                        onChange={() => setColor(c.id)}
                                    />
                                    <span className="dots" style={{background: c.hex}}>
                                        {color === c.id && <span className="tick">✓</span>}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="ePP-group">
                        <div className="ePP-label">Characters:</div>
                        <div className="ePP-grid">
                            {Characters.map(ch => (
                                <button 
                                    key={ch.id}
                                    type="button"
                                    className={`ePP-card ${charId === ch.id ? "is-active" : ""} ${ch.id}`}
                                    onClick={() => setCharId(ch.id)}
                                    aria-pressed={charId===ch.id}
                                >
                                    <div className="ePP-face" 
                                    style={{backgroundImage: `url(${ch.src})`,
                                    backgroundPosition: `${ch.focusX ?? 50}% ${ch.focusY ?? 35}%`,
                                    backgroundSize: `${(ch.zoom ?? 1.2) * 100}% auto`}}/>
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
