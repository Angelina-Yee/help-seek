import React from "react";
import "../styles/postcard.css";
import raccoon from "../assets/raccoon.png";

export default function Postcard(props={}){
    const {
        name= "Name",
        date= "Date",
        title= "Title",
        location= "Location",
        desc= "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        imageSrc,
        onMessage= () => {},
    } = props;

    return(
        <article className="postcard">
            <header className="pc-head">
                <div className="pc-user">
                    <button className="pc-avatar" aria-hidden>
                        <img className="ava-img" src={raccoon} alt="Profile avatar"/>
                    </button>
                    <div className="pc-name">{name}</div>
                </div>
                <div className="pc-date">{date}</div>
            </header>

            <div className="pc-media">
                {imageSrc ? (
                    <img src={imageSrc} alt={`${title}`} />
                ) : (
                    <div className="pc-media-placeholder" aria-hidden>
                        <span className="bloc a" />
                    </div>
                )}
            </div>

            <div className="pc-body">
                <div className="pc-text">
                    <div className="pc-title">Title: <span className="pc-bold">{title}</span></div>
                    <div className="pc-location">Location: <span className="pc-bold">{location}</span></div>
                    <p className="pc-desc">{desc}</p>
                </div>
                <button className="pc-message" onClick={onMessage}>
                    Message
                </button>
            </div>
        </article>
    );

}