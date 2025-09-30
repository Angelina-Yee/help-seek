import mongoose from "mongoose";

//Post Schema
const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["loss", "find"], required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    objectCategory: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "posts" }
);

postSchema.index({ type: 1, resolved: 1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);
