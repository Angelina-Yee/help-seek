import express from "express";
import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import Message from "../models/Message.js";
import { User } from "../models/User.js";
import { sendMessageNotification } from "../utils/sendEmail.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const me = String(req.user.id);
    const threads = await Thread.find({ participants: me }).sort({ updatedAt: -1 }).lean();
    
    const validThreads = threads.filter((t) => {
      const participants = t.participants || [];
      return participants.length === 2 && 
             participants.every(p => p && String(p).length === 24);
    });
    
    const threadMap = new Map();
    validThreads.forEach(thread => {
      const participants = (thread.participants || []).sort().join(',');
      if (!threadMap.has(participants) || 
          new Date(thread.updatedAt) > new Date(threadMap.get(participants).updatedAt)) {
        threadMap.set(participants, thread);
      }
    });
    
    const uniqueThreads = Array.from(threadMap.values()).sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    const data = uniqueThreads.map((t) => {
      const unreadCount =
        (t.unreadByUser?.get && t.unreadByUser.get(me)) ??
        t.unreadByUser?.[me] ??
        0;
      return {
        id: String(t._id),
        lastPreview: t.lastPreview || "",
        updatedAt: t.updatedAt,
        unread: Number(unreadCount) > 0,
        participants: (t.participants || []).map(String),
      };
    });
    res.json({ threads: data });
  } catch (e) { next(e); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const me = String(req.user.id);
    const { id } = req.params;
    const thread = await Thread.findOne({ _id: id, participants: me }).lean();
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    const peerId = (thread.participants || []).map(String).find((p) => p !== me) || null;

    let peer = null;
    const UserModel = mongoose.models?.User;
    if (peerId && UserModel) {
      try {
        const u = await UserModel.findById(peerId).select("_id name avatarCharId avatarColor").lean();
        if (u) {
          peer = {
            id: String(u._id),
            name: u.name || "User",
            avatarCharId: u.avatarCharId || null,
            avatarColor: u.avatarColor || null,
          };
        }
      } catch {}
    }

    res.json({
      id: String(thread._id),
      participants: (thread.participants || []).map(String),
      peerId,
      peer,
      lastPreview: thread.lastPreview || "",
      updatedAt: thread.updatedAt,
    });
  } catch (e) { next(e); }
});

router.get("/:id/messages", requireAuth, async (req, res, next) => {
  try {
    const me = String(req.user.id);
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
      from: String(m.sender) === me ? "me" : "other",
      kind: m.imageUrl ? "image" : "text",
      text: m.text,
      url: m.imageUrl,
      ts: new Date(m.createdAt).getTime(),
      seen: (m.seenBy || []).some((u) => String(u) === me),
    }));

    const nextCursor = docs.length === limit ? docs[0].createdAt : null;

    await Thread.updateOne({ _id: id }, { $set: { [`unreadByUser.${me}`]: 0 } });

    res.json({ messages, nextCursor });
  } catch (e) { next(e); }
});

router.post("/:id/messages", requireAuth, async (req, res, next) => {
  try {
    const me = String(req.user.id);
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
    const others = (thread.participants || []).map(String).filter((p) => p !== me);

    const inc = {};
    for (const other of others) inc[`unreadByUser.${other}`] = 1;

    await Thread.updateOne(
      { _id: id },
      {
        $set: { lastPreview: preview, lastSender: me, updatedAt: new Date() },
        ...(Object.keys(inc).length ? { $inc: inc } : {}),
      }
    );

  try {
    const recipients = await User.find({ _id: { $in: others } }).select("email name").lean();
    for (const r of recipients) {
      if (!r?.email) continue;
      await sendMessageNotification({
        to: r.email,
        recipientName: r.name || "",
        senderName: req.user?.name || "A user",
        preview,
        threadUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/inbox`,
      });
    }
  } catch {}

    res.json({ id: String(msg._id), ts: msg.createdAt.getTime(), seen: false });
  } catch (e) { next(e); }
});

router.patch("/:id/seen", requireAuth, async (req, res, next) => {
  try {
    const me = String(req.user.id);
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
    const me = String(req.user.id);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const otherUserId = String(userId);
    
    const allThreads = await Thread.find({ 
      participants: { $all: [me, otherUserId] }
    });
    
    let thread;
    if (allThreads.length === 0) {
      const participants = [me, otherUserId].sort();
      try {
        thread = await Thread.create({ participants, lastPreview: "" });
      } catch (error) {
        if (error.code === 11000) {
          thread = await Thread.findOne({ participants });
        } else {
          throw error;
        }
      }
    } else {
      thread = allThreads.reduce((latest, current) => 
        new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
      );
      
      const duplicateIds = allThreads
        .filter(t => t._id.toString() !== thread._id.toString())
        .map(t => t._id);
      
      if (duplicateIds.length > 0) {
        await Thread.deleteMany({ _id: { $in: duplicateIds } });
        await Message.deleteMany({ thread: { $in: duplicateIds } });
      }
    }
    res.json({ id: String(thread._id) });
  } catch (e) { next(e); }
});

router.post("/cleanup", requireAuth, async (req, res, next) => {
  try {
    const me = String(req.user.id);
    
    const allThreads = await Thread.find({ participants: me }).lean();
    
    if (allThreads.length === 0) {
      return res.json({ 
        message: "No threads found to clean up.",
        totalRemoved: 0
      });
    }
    
    const validThreads = allThreads.filter((t) => {
      const participants = t.participants || [];
      return participants.length === 2 && 
             participants.every(p => p && String(p).length === 24);
    });
    
    let threadToKeep = null;
    if (validThreads.length > 0) {
      threadToKeep = validThreads.reduce((latest, current) => 
        new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
      );
    }
    
    const threadsToDelete = allThreads.filter(t => 
      !threadToKeep || t._id.toString() !== threadToKeep._id.toString()
    );
    
    if (threadsToDelete.length > 0) {
      const deleteIds = threadsToDelete.map(t => t._id);
      await Thread.deleteMany({ _id: { $in: deleteIds } });
    }
    
    if (threadToKeep) {
      const orphanedMessages = await Message.find({ 
        thread: { $nin: [threadToKeep._id] }
      });
      if (orphanedMessages.length > 0) {
        await Message.deleteMany({ 
          thread: { $nin: [threadToKeep._id] }
        });
      }
    }
    
    res.json({ 
      message: `Aggressive cleanup complete. Removed ${threadsToDelete.length} threads. ${threadToKeep ? 'Kept 1 valid thread.' : 'No valid threads found.'}`,
      totalRemoved: threadsToDelete.length,
      keptThread: threadToKeep ? String(threadToKeep._id) : null
    });
  } catch (e) { next(e); }
});


export default router;