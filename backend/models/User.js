import mongoose from "mongoose";

const COLLEGES = ["Eight", "ERC", "John Muir", "Marshall", "Revelle", "Sixth", "Seventh", "Warren"];

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];

//User Schema, stores email, password, domain, name, and verification info
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailDomain: { type: String, required: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: null },

    college: { type: String, enum: COLLEGES, default: null },
    year: { type: String, enum: YEARS, default: null },

    verifiedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: "users" }
);

export const User = mongoose.model("User", userSchema);
export const USER_ENUMS = { COLLEGES, YEARS };