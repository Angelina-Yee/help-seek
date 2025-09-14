import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailDomain: { type: String, required: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: null },
    verifiedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: "users" }
);

export const User = mongoose.model("User", userSchema);