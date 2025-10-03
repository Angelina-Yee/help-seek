import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import "../styles/inbox.css";
import "../assets/raccoon.png";
import sendArrow from "../assets/send-arrow.png";

// (Optional) base API if you later upload to server:
// const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

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

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function Inbox() {
  const [threads, setThreads] = useState(seedThreads);
  const [selectedId, setSelectedId] = useState(seedThreads[0]?.id || null);
  const [messagesByThread, setMessagesByThread] = useState(seedMessages);
  const [draft, setDraft] = useState("");
  const [threadSearch, setThreadSearch] = useState(""); // search box text

  const scrollerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  const myAvatar = "/img/raccoon.png";
  const otherAvatar = "/img/raccoon.png";

  const current = useMemo(
    () => threads.find((t) => t.id === selectedId) || null,
    [threads, selectedId]
  );

  // Filtered thread list (case‑insensitive match on name or preview)
  const filteredThreads = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.preview || "").toLowerCase().includes(q)
    );
  }, [threads, threadSearch]);

  const msgs = messagesByThread[selectedId] || [];

  useEffect(() => {
    if (!selectedId) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, unread: false } : t))
    );
  }, [selectedId]);

  const autoGrow = useCallback((ta) => {
    if (!ta) return;
    const cs = window.getComputedStyle(ta);
    const line = parseFloat(cs.lineHeight) || 20;
    const pad =
      (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const base = line + pad;
    ta.style.height = "1px";
    const next = Math.min(ta.scrollHeight, 240);
    ta.style.height = Math.max(base, next) + "px";
    ta.style.overflowY = ta.scrollHeight > 240 ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    autoGrow(textareaRef.current);
  }, [draft, selectedId, autoGrow]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [selectedId, messagesByThread]);

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
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;

    // Local preview URL
    const objectUrl = URL.createObjectURL(file);
    const id = makeId();

    // Image message object
    const newMsg = {
      id,
      from: "me",
      kind: "image",
      url: objectUrl,
      name: file.name,
      uploaded: false, // will flip true after real upload (stub)
    };

    setMessagesByThread((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));

    // Update thread preview
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, preview: "Image" } : t))
    );

    e.target.value = "";

    // Optional: upload to backend (uncomment & implement endpoint)
    // uploadImage(file, id, selectedId);
  };

  // OPTIONAL upload stub
  /*
  const uploadImage = async (file, tempId, threadId) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) {
        setMessagesByThread((prev) => ({
          ...prev,
          [threadId]: prev[threadId].map((m) =>
            m.id === tempId ? { ...m, url: data.url, uploaded: true } : m
          ),
        }));
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };
  */

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
      <header className="home-navbar">
        <div className="home-logo">help n seek</div>
        <div className="home-prof">
          <button className="pc-avatar" aria-hidden="true" type="button">
            <img className="ava-img" src={myAvatar} alt="Profile avatar" />
          </button>
        </div>
      </header>

      <div className="inbox-page">
        <aside className="inbox-list">
          <h1>INBOX</h1>
          <div className="thread-search-wrap">
            <input
              type="text"
              className="thread-search"
              placeholder="Search messages..."
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              aria-label="Search threads"
            />
          </div>
          <div className="thread-list">
            {filteredThreads.length === 0 ? (
              <div className="thread-empty">No matches</div>
            ) : (
              filteredThreads.map((t) => (
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
              ))
            )}
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
              msgs.map((m) => {
                const mine = m.from === "me";
                return (
                  <div
                    key={m.id}
                    className={`msg-row ${mine ? "me" : "other"}`}
                  >
                    {!mine && (
                      <div className="avatar">
                        <img src={otherAvatar} alt="" />
                      </div>
                    )}

                    {m.kind === "image" ? (
                      <div
                        className={`bubble image ${mine ? "me" : "other"}`}
                        title={m.name || "image"}
                      >
                        <img
                          src={m.url}
                          alt={m.name || "sent image"}
                          draggable="false"
                        />
                        {!m.uploaded && (
                          <span className="uploading-badge">uploading...</span>
                        )}
                      </div>
                    ) : (
                      <div className={`bubble ${mine ? "me" : "other"}`}>
                        {m.text}
                      </div>
                    )}

                    {mine && (
                      <div className="avatar">
                        <img src={myAvatar} alt="" />
                      </div>
                    )}
                  </div>
                );
              })
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
              <img className="send-arrow" src={sendArrow} alt="" />
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
              **Messages are being monitored for user safety and the purpose of
              this site.**
            </strong>
          </div>
        </section>
      </div>
    </div>
  );
}
