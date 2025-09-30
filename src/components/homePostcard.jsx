import React, { useState } from "react";
import { Link } from "react-router-dom";
import raccoon from "../assets/raccoon.png";
import PostZoom from "./postZoom";
import "../styles/postcard.css";

export default function HomePostcard(props={}){
    const {
        name= "Name",
        date= "Date",
        imageSrc,
        avatarSrc,
        avatarBgColorHex,
        profileHref,
        type = "default",
        className= "",
        imgAlt = "post image",
    } = props;

    const [showZoom, setShowZoom] = useState(false);
    const typeClass = type === "find" ? "is-find" : type === "loss" ? "is-loss" : "";

    return(
        <article className={`postcard ${className}`}>
            <header className="pc-head">
                <div className="pc-user">
                    {profileHref ? (
                        <Link
                            to={profileHref}
                            className="pc-avatar"
                            aria-label="Open Profile"
                            style={{
                                backgroundColor: avatarBgColorHex || "transparent",
                                borderRadius: "50%",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 36,
                                height: 36,
                                padding: 0,
                                border: "none",
                                textDecoration: "none",
                            }}
                        >
                            <img 
                                className="ava-img"
                                src={avatarSrc || raccoon}
                                alt="Profile avatar"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  objectPosition: "center",
                                  transform: "translate(-3px, 6px)",
                                  display: "block",
                                }}
                            />
                        </Link>
                      ) : (
                        <button
                        className="pc-avatar"
                        aria-hidden
                        style={{
                          backgroundColor: avatarBgColorHex || "transparent",
                          borderRadius: "50%",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          padding: 0,
                          border: "none",
                        }}
                    >
                        <img 
                            className="ava-img"
                            src={avatarSrc || raccoon}
                            alt="Profile avatar"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                objectPosition: "center",
                                transform: "translate(-3px, 6px)",
                                display: "block",
                            }}
                        />
                    </button>
                    )}

                    <div className="pc-name">{name}</div>
                </div>

                <div className="pc-date">{date}</div>
            </header>

            <div className="pc-media">
                {imageSrc ? (
                    <button
                        type="button"
                        className="pc-media-btn"
                        onClick={() => setShowZoom(true)}
                        aria-label="Open image"
                        style={{
                        all: "unset",
                        cursor: "zoom-in",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                    }}
                  >
                        <img src={imageSrc} alt={imgAlt}/>
                    </button>
                ) : (
                    <div className="pc-media-placeholder" aria-hidden>
                        <span className="bloc a" />
                    </div>
                )}
            </div>

            {showZoom && imageSrc && (
                <PostZoom src={imageSrc} alt={imgAlt} onClose={() => setShowZoom(false)} />
            )}
        </article>
    );
}