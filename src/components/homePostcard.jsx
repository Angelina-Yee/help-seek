import React from "react";
import "../styles/postcard.css";

export default function HomePostcard(props={}){
    const {
        name= "Name",
        date= "Date",
        imageSrc,
        className= "",
    } = props;

    return(
        <article className={`postcard ${className}`}>
            <header className="pc-head">
                <div className="pc-user">
                    <div className="pc-name">{name}</div>
                </div>
                <div className="pc-date">{date}</div>
            </header>

            <div className="pc-media">
                {imageSrc ? (
                    <img src={imageSrc} />
                ) : (
                    <div className="pc-media-placeholder" aria-hidden>
                        <span className="bloc a" />
                    </div>
                )}
            </div>
        </article>
    );

}