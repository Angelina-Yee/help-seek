// backend/routes/threads.js
import express from "express";
import Thread from "../models/Thread.js";
import Message from "../models/Message.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const me = req.user._id;
    const threads = await Thread.find({ participants: me }).sort({ updatedAt: -1 }).lean();

    const data = threads.map((t) => {
      const unreadCount =
        (t.unreadByUser?.get && t.unreadByUser.get(String(me))) ??
        t.unreadByUser?.[String(me)] ??
        0;
      return {
        id: String(t._id),
        lastPreview: t.lastPreview || "",
        updatedAt: t.updatedAt,
        unread: Number(unreadCount) > 0,
        participants: t.participants.map(String),
      };
    });

    res.json({ threads: data });
  } catch (e) { next(e); }
});

router.get("/:id/messages", requireAuth, async (req, res, next) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const cursor = req.query.cursor ? new Date(req.query.cursor) : null;

    const thread = await Thread.findOne({ _id: id, participants: me });
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    const findQuery = { thread: id };
    if (cursor) findQuery.createdAt = { $lt: cursor };

    const docs = await Message.find(findQuery).sort({ createdAt: -1 }).limit(limit).lean();
    const messages = docs.reverse().map((m) => ({
      id: String(m._id),
      from: String(m.sender) === String(me) ? "me" : "other",
      kind: m.imageUrl ? "image" : "text",
      text: m.text,
      url: m.imageUrl,
      ts: new Date(m.createdAt).getTime(),
      seen: m.seenBy?.some((u) => String(u) === String(me)) || false,
    }));

    const nextCursor = docs.length === limit ? docs[0].createdAt : null;

    const key = `unreadByUser.${me}`;
    await Thread.updateOne({ _id: id }, { $set: { [key]: 0 } });

    res.json({ messages, nextCursor });
  } catch (e) { next(e); }
});

router.post("/:id/messages", requireAuth, async (req, res, next) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    const { text, imageUrl } = req.body;
    if (!text && !imageUrl) return res.status(400).json({ error: "Provide text or imageUrl" });

    const thread = await Thread.findOne({ _id: id, participants: me });
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    const msg = await Message.create({
      thread: id,
      sender: me,
      text: text || undefined,
      imageUrl: imageUrl || undefined,
      seenBy: [me],
    });

    const preview = imageUrl ? "Image" : String(text).slice(0, 120);
    const others = thread.participants.filter((p) => String(p) !== String(me));

    const inc = {};
    for (const other of others) inc[`unreadByUser.${other}`] = 1;

    await Thread.updateOne(
      { _id: id },
      {
        $set: { lastPreview: preview, lastSender: me, updatedAt: new Date() },
        ...(Object.keys(inc).length ? { $inc: inc } : {}),
      }
    );

    res.json({ id: String(msg._id), ts: msg.createdAt.getTime(), seen: false });
  } catch (e) { next(e); }
});

router.patch("/:id/seen", requireAuth, async (req, res, next) => {
  try {
    const me = req.user._id;
    const { id } = req.params;

    const thread = await Thread.findOne({ _id: id, participants: me });
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    await Message.updateMany({ thread: id, seenBy: { $ne: me } }, { $addToSet: { seenBy: me } });
    await Thread.updateOne({ _id: id }, { $set: { [`unreadByUser.${me}`]: 0 } });

    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post("/open", requireAuth, async (req, res, next) => {
  try {
    const me = req.user._id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const participants = [String(me), String(userId)].sort();
    let thread = await Thread.findOne({ participants });

    if (!thread) {
      thread = await Thread.create({ participants, lastPreview: "" });
    }
    res.json({ id: String(thread._id) });
  } catch (e) { next(e); }
});

export default router;

