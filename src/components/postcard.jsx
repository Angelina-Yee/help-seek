import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/postcard.css";
import raccoon from "../assets/raccoon.png";
import PostZoom from "./postZoom";

// Postcard Component
function Postcard(props = {}) {
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
    onResolve = () => {},
    variant = "default",
    postId,
    resolving = false,
    profileHref,
    ownerId,
    currentUserId,
    ownerAvatarCharId,
    ownerAvatarColor,
  } = props;

   const [showZoom, setShowZoom] = useState(false);

    const isMine =
       ownerId != null &&
       currentUserId != null &&
       String(ownerId) === String(currentUserId);

  const inboxState = {
    userId: ownerId || null,
    postContext: { 
        postId, 
        title, 
        imageSrc, 
        location, 
        ownerName: name },
        avatarCharId: ownerAvatarCharId,
        avatarColor: ownerAvatarColor,
  };

  const MessageAction = () => {
    if (variant !== "profile" && isMine) return null;
    if (!ownerId) {
      return (
        <button className="pc-message" onClick={onMessage}>
          Message
        </button>
      );
    }

    return (
      <Link
        className="pc-message"
        to="/inbox"
        state={inboxState}
        title="Send a message about this post"
        data-ownerid={ownerId}
      >
        Message
      </Link>
    );
  };

  //HTML
  return (
    <article className="postcard">
      <header className="pc-head">
        <div className="pc-user">
          {profileHref ? (
            <Link
                to={profileHref}
                className="pc-avatar"
                aria-label="Open profile"
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
        ):(
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
            <img src={imageSrc} alt={title || "post image"} />
          </button>
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

        {variant === "profile" ? (
          <button
            className="pc-message"
            onClick={() => onResolve(postId)}
            disabled={resolving}
            aria-label="Mark post as resolved"
            title="Mark as resolved"
          >
            {resolving ? "Resolving…" : "Resolved"}
          </button>
        ) : (
          <MessageAction />
        )}
      </div>

      {showZoom && imageSrc && (
        <PostZoom 
            src={imageSrc} 
            alt={title || "image"} 
            onClose={() => setShowZoom(false)} 
        />
      )}
    </article>
  );
}

export default Postcard