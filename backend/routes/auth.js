import express from "express";
import { body, validationResult } from "express-validator";
import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {RefreshToken} from "../models/RefreshToken.js";

import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";


//Router handling signup and login
const router = express.Router();

//Email ends with @ucsd.edu
function ucsdOnly(email) {
  return typeof email === "string" && email.toLowerCase().endsWith("@ucsd.edu");
};

//Generate random 5-digit OTP code
function makeOtp() {
  return String(Math.floor(Math.random() * 100000)).padStart(5, "0");
};

//Create temp JWT tokens
function signSignupToken(email) {
  return jwt.sign({ typ: "signup", email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "30m",
  });
};

//Access token for logged in users
function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

//Refresh token to get new access tokens
function signRefreshToken(user) {
  return jwt.sign(
    {sub: user._id.toString(), typ: "refresh"},
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
};

//Store refresh token in DB
async function persistRefreshToken({user, token, req}) {
  const decoded = jwt.decode(token);
  await RefreshToken.create({
    userId: user.id,
    token,
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: req.get["user-agent"],
    ip: req.ip,
  });
}

//Set refresh token as HttpOnly cookie
function setRefreshCookie(res, token) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

// Requeast sign up code via email
router.post(
  "/signup/request-code",
  body("email").isEmail(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, { errors: errors.array() });

      const email = String(req.body.email).trim().toLowerCase();
      if (!ucsdOnly(email)) throw createError(400, "UCSD email required (@ucsd.edu)");

      const existing = await User.findOne({ email });
      if (existing && existing.verifiedAt) {
        return res
          .status(409)
          .json({ message: "Account already exists. Redirecting to log in." });
      };

      const code = makeOtp();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await Otp.findOneAndUpdate(
        { email, type: "SIGNUP" },
        { email, type: "SIGNUP", code, expiresAt, attempts: 0 },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await sendEmail({
        to: email,
        subject: "Your Help N Seek verification code",
        html: `
          <p>Your verification code is:</p>
          <div style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</div>
          <p>This code expires in 15 minutes.</p>
        `,
      });

      return res.json({ message: "Code sent", next: "verify-code" });
    } catch (err) {
      next(err);
    }
  }
);

//Verify code enteredd by the user
router.post(
  "/signup/verify-code",
  body("email").isEmail(),
  body("code").isLength({ min: 5, max: 5 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, { errors: errors.array() });

      const email = String(req.body.email).trim().toLowerCase();
      const code = String(req.body.code).trim();

      const otp = await Otp.findOne({ email, type: "SIGNUP" });
      if (!otp) throw createError(400, "Code expired or not found. Request a new one.");

      if (otp.expiresAt.getTime() < Date.now()) {
        await Otp.deleteOne({ _id: otp._id });
        throw createError(400, "Code expired. Request a new one.");
      };

      if (otp.code !== code) {
        otp.attempts = (otp.attempts || 0) + 1;
        await otp.save();
        if (otp.attempts >= 5) {
          await Otp.deleteOne({ _id: otp._id });
          throw createError(429, "Too many attempts. Request a new code.");
        };
        throw createError(401, "Invalid code.");
      };

      const signupToken = signSignupToken(email);

      res.json({ message: "Email verified", next: "complete", signupToken });
    } catch (err) {
      next(err);
    }
  }
);

//Sign up complete: set name and password
router.post(
  "/signup/complete",
  body("firstName").isString().isLength({ min: 1 }),
  body("lastName").isString().isLength({ min: 1 }),
  body("password").isLength({ min: 8 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, { errors: errors.array() });

      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) throw createError(401, "Missing signup token");

      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      } catch {
        throw createError(401, "Invalid or expired signup token");
      }
      if (payload.typ !== "signup") throw createError(401, "Wrong token type");

      const email = String(payload.email).toLowerCase();
      const { firstName, lastName, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        throw createError(409, "Account already exists. Please log in.");
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        email,
        name: `${firstName.trim()} ${lastName.trim()}`,
        passwordHash,
        verifiedAt: new Date(),
        emailDomain: "ucsd.edu",
      });

      await Otp.deleteMany({ email, type: "SIGNUP" });

      return res.status(201).json({ message: "Signup complete. You can now log in." });
    } catch (err) {
      next(err);
    }
  }
);

//Login with email and password
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, { errors: errors.array() });

      const email = String(req.body.email).trim().toLowerCase();
      const { password } = req.body;

      const user = await User.findOne({ email });
      if (!user) throw createError(401, "Your password is incorrect or this account does not exist.");
      if (!user.verifiedAt) throw createError(403, "Please verify your email to continue.");

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) throw createError(401, "Your password is incorrect or this account does not exist.");

      const accessToken = signAccessToken(user);
      const refreshToken = signRefreshToken(user);
      await persistRefreshToken({ user, token: refreshToken, req });
      setRefreshCookie(res, refreshToken);

      res.status(201).json({
        message: "Login successful",
        user: { id: user._id, email: user.email, name: user.name, college: user.college, year: user.year },
        accessToken,
        expiresIn: 900
      });
    } catch (err) {
      next(err);
    }
  }
);

// Refresh access token using refresh token
router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw createError(401, "Missing refresh token");

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (payload.typ !== "refresh") throw createError(401, "Wrong token type");

    const doc = await RefreshToken.findOne({ token, revokedAt: null });
    if (!doc) throw createError(401, "Refresh token invalid");

    // rotate the refresh token
    await RefreshToken.updateOne({ _id: doc._id }, { $set: { revokedAt: new Date() } });

    const user = await User.findById(payload.sub);
    if (!user) throw createError(401, "User no longer exists");

    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    await persistRefreshToken({ user, token: newRefresh, req });
    setRefreshCookie(res, newRefresh);

    res.json({ accessToken: newAccess, expiresIn: 900 });
  } catch (err) {
    res.clearCookie("refresh_token", { path: "/auth/refresh" });
    next(createError(401, "Please log in again"));
  }
});


//Logout and revoke refresh token
router.post("/logout", async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) {
    await RefreshToken.updateOne({ token, revokedAt: null }, { $set: { revokedAt: new Date() } });
  }
  res.clearCookie("refresh_token", { path: "/auth/refresh" });
  res.json({ message: "Logged out" });
});

export default router;