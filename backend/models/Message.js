import mongoose from "mongoose";
const { Schema, model } = mongoose;

const MessageSchema = new Schema(
  {
    thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    imageUrl: { type: String },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

MessageSchema.index({ thread: 1, createdAt: 1 });

const Message = model("Message", MessageSchema);
export default Message;

