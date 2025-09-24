import React from "react";
import "../styles/postcard.css";
import raccoon from "../assets/raccoon.png";

export default function Postcard(props = {}) {
  const {
    name = "Name",
    date = "Date",
    title = "Title",
    location = "Location",
    desc = "",
    imageSrc,
    onMessage = () => {},
    avatarSrc,
    avatarBgColorHex,
  } = props;

  return (
    <article className="postcard">
      <header className="pc-head">
        <div className="pc-user">
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
            <div className="pc-name">{name}</div>
        </div>
        <div className="pc-date">{date}</div>
    </header>

      <div className="pc-media">
        {imageSrc ? (
          <img src={imageSrc} alt={title || "post image"} />
        ) : (
          <div className="pc-media-placeholder" aria-hidden>
            <span className="bloc a" />
          </div>
        )}
      </div>

      <div className="pc-body">
        <div className="pc-text">
          <div className="pc-title">
            Title: <span className="pc-bold">{title}</span>
          </div>
          <div className="pc-location">
            Location: <span className="pc-bold">{location}</span>
          </div>
          {desc && <p className="pc-desc">{desc}</p>}
        </div>
        <button className="pc-message" onClick={onMessage}>Message</button>
      </div>
    </article>
  );
}
