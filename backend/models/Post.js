import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["loss", "find"], required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    objectCategory: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String },
  },
  { timestamps: true, collection: "posts" }
);

export const Post = mongoose.model("Post", postSchema);
