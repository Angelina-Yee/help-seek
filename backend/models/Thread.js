import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ThreadSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastPreview: { type: String, default: "" },
    lastSender: { type: Schema.Types.ObjectId, ref: "User" },
    unreadByUser: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

ThreadSchema.index({ updatedAt: -1 });

ThreadSchema.index({ participants: 1 });

ThreadSchema.index({ participants: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    participants: { $size: 2 }
  }
});

const Thread = model("Thread", ThreadSchema);
export default Thread;
