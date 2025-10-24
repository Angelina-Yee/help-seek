import mongoose from "mongoose";

const COLLEGES = ["Eighth", "ERC", "John Muir", "Marshall", "Revelle", "Sixth", "Seventh", "Warren"];

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];

const AVATAR_CHAR = [
  "bear", "bunny", "cat", "chick", "chicken","cow", "dog", "goat", "koala", "lion","monkey", "turtle", "pig", "raccoon", "sheep", "tiger"
];

const AVATAR_COLOR = ["blue", "yellow", "orange", "pink", "mint"];

//User Schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailDomain: { type: String, required: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: null },

    college: { type: String, enum: COLLEGES, default: null },
    year: { type: String, enum: YEARS, default: null },


    avatarCharId: {type: String, enum: AVATAR_CHAR, default: "raccoon"},
    avatarColor: {type: String, enum: AVATAR_COLOR, default: "blue"},

    verifiedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    resolvedCount: { type: Number, default: 0 },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true }
    },
  },
  { collection: "users" }
);

// Hide sensitive info when converting to JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);
export const USER_ENUMS = { COLLEGES, YEARS, AVATAR_CHAR, AVATAR_COLOR };