import React, {useEffect, useMemo, useRef, useState} from "react";
import { createPortal } from "react-dom";
import "../styles/notif.css";
import { MdNotificationsNone } from 'react-icons/md';

function timeAgo(iso){
    const diff = Date.now() - Date.parse(iso);
    const s = Math.floor(diff/1000);
    if(s<60) return `${s}s ago`;
    const m = Math.floor(s/60);
    if(m<60) return `${m}m ago`;
    const h= Math.floor(m/60);
    if(h<24) return `${h}h ago`;
    const d=Math.floor(h/24);
    return `${d}d ago`;
}

export default function Notif({notifications = []}){
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const popRef = useRef(null);

    const STORAGE_KEY = "notif:lastSeen";
    const [lastSeen, setLastSeen] = useState(() => {
        const s = localStorage.getItem(STORAGE_KEY);
        return s ? Number(s) : 0;
    });

    const unreadCount = useMemo(() => {
        const last = lastSeen || 0;
        return notifications.filter(n => Date.parse(n.createdAt) > last).length;
    }, [notifications, lastSeen]);

    const offsetRight = 25;
    const [pos, setPos] = useState({top: 0, left: 0, minWidth: 380});
    const positionMenu = () => {
        const a = btnRef.current;
        if (!a) return;
        const b = a.getBoundingClientRect();
        const minWidth = Math.max(380, b.width);
        const top = b.bottom + 8 + window.scrollY;
        const left= b.right - minWidth -offsetRight + window.scrollX;
        setPos({top, left, minWidth});
    };

    const toggle = () => {
        positionMenu();
        setOpen(true);
        const now=Date.now();
        setLastSeen(now);
        localStorage.setItem(STORAGE_KEY, String(now));
    };
    const toggleOff = () => setOpen(false);

    useEffect(() => {
        if(!open) return;
        const onEsc= (e) => e.key === "Escape" && toggleOff();
        const onReflow = () => positionMenu();
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onEsc);
        window.addEventListener("resize", onReflow);
        window.addEventListener("scroll", onReflow, true);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener("keydown", onEsc);
            window.removeEventListener("resize", onReflow);
            window.removeEventListener("scroll", onReflow, true);
        };
    }, [open]);

    return(
        <div className="notif-wrap">
            <button
                ref={btnRef}
                className="btn-notif"
                aria-haspopup= "dialog"
                aria-expanded = {open ? "true" : "false"}
                onClick={() => (open ? toggleOff() : toggle())}
            >
                <MdNotificationsNone/>
                {unreadCount>0 && (
                    <span className="notif-badge">
                        {unreadCount>99 ? "99+": unreadCount}
                    </span>
                )}
            </button>
            {open && createPortal(
                <>
                    <div className="notif-overlay" onMouseDown={toggleOff} aria-hidden="true"/>
                    <div ref={popRef} className="notif-popup" role="dialog" aria-label="Notifications" onMouseDown={(e) => e.stopPropagation()} style={{"--notif-top":`${pos.top}px`, "--notif-left": `${pos.left}px`, "--notif-minw": `${pos.minWidth}px`,}}>
                        <div className="notif-head">
                            <h3>Notifications</h3>
                            <button className="notif-clear" 
                                onClick={() => {
                                const now=Date.now();
                                setLastSeen(now);
                                localStorage.setItem(STORAGE_KEY, String(now));}}
                            >
                                Mark all read
                            </button>
                        </div>
                        <ul className="notif-list">
                            {notifications.length === 0 ? (
                                <li className="notif-empty">
                                    You're all caught up!
                                </li>
                            ): (
                                notifications.map((n) => (
                                    <li key={n.id} className={`notif-item ${Date.parse(n.createdAt)>lastSeen?"is-new": ""}`}>
                                        <div className="notif-title">{n.title}</div>
                                        {n.body && <div className="notif-body">{n.body}</div>}
                                        <div className="notif-time">{timeAgo(n.createdAt)}</div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}