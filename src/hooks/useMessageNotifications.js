import { useEffect, useState } from "react";
import { listThreads } from "../api";

export function useMessageNotifications(pollMs = 8000) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    let timer;

    const fetchOnce = async () => {
      try {
        const data = await listThreads();
        const threads = data?.threads || [];
        const mapped = threads
          .filter((t) => t.unread)
          .slice(0, 10)
          .map((t) => ({
            id: t.id,
            title: "New reply",
            body: t.lastPreview || "New message",
            createdAt: t.updatedAt || new Date().toISOString(),
          }));
        if (mounted) setItems(mapped);
      } catch (_) {}
    };

    const loop = async () => {
      await fetchOnce();
      timer = setTimeout(loop, pollMs);
    };

    loop();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [pollMs]);

  return items;
}


