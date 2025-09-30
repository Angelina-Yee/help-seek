import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import "../styles/inbox.css";

// Seed data (front‑end only)
const seedThreads = [
  {
    id: "t1",
    name: "Name0",
    preview: "message",
    unread: false,
    avatar: "/img/raccoon.png",
  },
  {
    id: "t2",
    name: "Name",
    preview: "message",
    unread: true,
    avatar: "/img/raccoon.png",
  },
];

const seedMessages = {
  t1: [
    { id: "m1", from: "other", text: "Hello! Is this still available?" },
    { id: "m2", from: "me", text: "Yes, it is." },
  ],
  t2: [],
};

// Helper ID generator (avoids globalThis)
const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function Inbox() {
  // Thread + message state
  const [threads, setThreads] = useState(seedThreads);
  const [selectedId, setSelectedId] = useState(seedThreads[0]?.id || null);
  const [messagesByThread, setMessagesByThread] = useState(seedMessages);

  // Draft
  const [draft, setDraft] = useState("");

  // Navbar local state
  const [query, setQuery] = useState("");
  const [, setModal] = useState(null); // placeholder for "New Post" action

  // Refs
  const scrollerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  // Avatars (both raccoon for now)
  const myAvatar = "/img/raccoon.png";
  const otherAvatar = "/img/raccoon.png";

  // Derived selected thread
  const current = useMemo(
    () => threads.find((t) => t.id === selectedId) || null,
    [threads, selectedId]
  );

  const msgs = messagesByThread[selectedId] || [];

  // Mark selected as read
  useEffect(() => {
    if (!selectedId) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, unread: false } : t))
    );
  }, [selectedId]);

  // Auto-grow helper (memoized to avoid deps warnings)
  const autoGrow = useCallback((ta) => {
    if (!ta) return;
    const cs = window.getComputedStyle(ta);
    const line = parseFloat(cs.lineHeight) || 20;
    const pad =
      (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const base = line + pad; // one line height
    ta.style.height = "1px"; // reset
    const next = Math.min(ta.scrollHeight, 240);
    ta.style.height = Math.max(base, next) + "px";
    ta.style.overflowY = ta.scrollHeight > 240 ? "auto" : "hidden";
  }, []);

  // Grow on draft / thread change
  useLayoutEffect(() => {
    autoGrow(textareaRef.current);
  }, [draft, selectedId, autoGrow]);

  // Scroll to bottom on message changes
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [selectedId, messagesByThread]);

  // Handlers
  const onSelectThread = (id) => setSelectedId(id);

  const onDraftChange = useCallback(
    (e) => {
      setDraft(e.target.value);
      autoGrow(e.currentTarget);
    },
    [autoGrow]
  );

  const send = () => {
    const text = draft.trim();
    if (!text || !selectedId) return;
    const id = makeId();
    const newMsg = { id, from: "me", text };
    setMessagesByThread((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, preview: text } : t))
    );
    setDraft("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const pickImage = () => fileRef.current?.click();

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f || !selectedId) return;
    const id = makeId();
    const newMsg = { id, from: "me", text: "[image attached]" };
    setMessagesByThread((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedId ? { ...t, preview: "[image attached]" } : t
      )
    );
    e.target.value = "";
  };

  // Components
  const ThreadButton = ({ thread }) => (
    <button
      type="button"
      className={`thread ${thread.id === selectedId ? "active" : ""}`}
      onClick={() => onSelectThread(thread.id)}
    >
      <div className="name">{thread.name}</div>
      <div className="preview">{thread.preview}</div>
      {thread.unread && <span className="unread-dot" />}
    </button>
  );

  const Avatar = ({ src }) => (
    <div className="avatar">
      <img src={src} alt="" />
    </div>
  );

  return (
    <div className="home">
      {/* Navbar */}
      <header className="home-navbar">
        <div className="home-logo">help n seek</div>
        <nav className="home-top">
          <input
            placeholder="Search"
            className="home-searchbar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="home-search" aria-label="search" type="button">
            ⌕
          </button>
          <button
            className="home-post"
            aria-label="create"
            type="button"
            onClick={() => setModal("choice")}
          >
            <span className="new">New Post</span>
          </button>
        </nav>
        <div className="home-prof">
          <button className="pc-avatar" aria-hidden="true" type="button">
            <img className="ava-img" src={myAvatar} alt="Profile avatar" />
          </button>
        </div>
      </header>

      {/* Inbox layout now INSIDE .home */}
      <div className="inbox-page">
        <aside className="inbox-list">
          <h1>INBOX</h1>
          <div className="thread-list">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`thread ${t.id === selectedId ? "active" : ""}`}
                onClick={() => setSelectedId(t.id)}
              >
                <div className="name">{t.name}</div>
                <div className="preview">{t.preview}</div>
                {t.unread && <span className="unread-dot" />}
              </button>
            ))}
          </div>
        </aside>

        <section className="chat">
          <header className="chat-header">
            <div className="chat-title">
              <div className="chat-title-avatar">
                <img
                  src={otherAvatar}
                  alt={`${current?.name || "User"} avatar`}
                />
              </div>
              <div className="chat-title-name">
                {current?.name || "Select a chat"}
              </div>
            </div>
          </header>

          <div className="chat-body" ref={scrollerRef}>
            {msgs.length === 0 ? (
              <div className="empty">
                {current
                  ? `${current.name} has sent a message regarding your post.`
                  : "Choose a conversation."}
              </div>
            ) : (
              msgs.map((m) => (
                <div
                  key={m.id}
                  className={`msg-row ${m.from === "me" ? "me" : "other"}`}
                >
                  {m.from !== "me" && (
                    <div className="avatar">
                      <img src={otherAvatar} alt="" />
                    </div>
                  )}
                  <div className={`bubble ${m.from === "me" ? "me" : "other"}`}>
                    {m.text}
                  </div>
                  {m.from === "me" && (
                    <div className="avatar">
                      <img src={myAvatar} alt="" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <footer className="composer">
            <button
              type="button"
              className="icon-btn"
              aria-label="Attach image"
              onClick={pickImage}
            >
              <svg viewBox="0 0 24 24" width="26" height="26">
                <rect
                  x="3.5"
                  y="5.5"
                  width="17"
                  height="13"
                  rx="1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle cx="9" cy="10" r="2" fill="currentColor" />
                <path
                  d="M4 16l5-5 3 3 4-4 4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              className="composer-textarea"
              placeholder="Message..."
              value={draft}
              onChange={onDraftChange}
              onKeyDown={onKeyDown}
              rows={1}
            />

            <button
              className="send-arrow-btn"
              type="button"
              onClick={send}
              aria-label="Send"
            >
              <img
                className="send-arrow"
                src="/img/send-arrow.png"
                alt="Send"
              />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFile}
            />
          </footer>

          <div className="composer-note">
            <strong>
              Messages are being monitored for user safety and the purpose of
              this site.
            </strong>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Inbox;
