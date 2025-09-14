import express from "express";
import { body, validationResult } from "express-validator";
import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

function ucsdOnly(email) {
  return typeof email === "string" && email.toLowerCase().endsWith("@ucsd.edu");
}

function makeOtp() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

function signSignupToken(user) {
  return jwt.sign(
    { typ: "signup", sub: user._id.toString(), email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "30m" }
  );
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

router.post(
  "/signup/request-code",
  body("email").isEmail(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, { errors: errors.array() });

      const email = req.body.email.toLowerCase();
      if (!ucsdOnly(email)) throw createError(400, "UCSD email required (@ucsd.edu)");

      let user = await User.findOne({ email });

      if (user && user.verifiedAt) {
        throw createError(409, "Account already exists. Please log in.");
      }

      if (!user) {
        user = await User.create({
          email,
          emailDomain: "ucsd.edu",
          passwordHash: "__PENDING__",
          name: null,
          verifiedAt: null
        });
      }

      const code = makeOtp();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await Otp.deleteMany({ userId: user._id, type: "SIGNUP" });
      await Otp.create({ userId: user._id, type: "SIGNUP", code, expiresAt });

      await sendEmail({
        to: user.email,
        subject: "Your Help N Seek verification code",
        html: `
          <p>Your verification code is:</p>
          <div style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</div>
          <p>This code expires in 15 minutes.</p>
        `
      });

      res.json({ message: "Code sent", next: "verify-code" });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/signup/verify-code",
  body("email").isEmail(),
  body("code").isLength({ min: 6, max: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, { errors: errors.array() });

      const email = req.body.email.toLowerCase();
      const code = String(req.body.code).trim();

      const user = await User.findOne({ email });
      if (!user) throw createError(404, "User not found. Start over.");

      const otp = await Otp.findOne({ userId: user._id, type: "SIGNUP" });
      if (!otp) throw createError(400, "Code expired or not found. Request a new one.");
      if (otp.expiresAt.getTime() < Date.now()) {
        await Otp.deleteOne({ _id: otp._id });
        throw createError(400, "Code expired. Request a new one.");
      }

      if (otp.code !== code) {
        otp.attempts += 1;
        await otp.save();
        if (otp.attempts >= 5) {
          await Otp.deleteOne({ _id: otp._id });
          throw createError(429, "Too many attempts. Request a new code.");
        }
        throw createError(401, "Invalid code.");
      }

      const now = new Date();
      if (!user.verifiedAt) user.verifiedAt = now;
      await user.save();
      await Otp.deleteOne({ _id: otp._id });

      const signupToken = signSignupToken(user);
      res.json({ message: "Email verified", next: "complete", signupToken });
    } catch (err) {
      next(err);
    }
  }
);

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

      const user = await User.findById(payload.sub);
      if (!user) throw createError(404, "User not found");
      if (!user.verifiedAt) throw createError(400, "Verify email first");

      const { firstName, lastName, password } = req.body;
      user.name = `${firstName.trim()} ${lastName.trim()}`;
      user.passwordHash = await bcrypt.hash(password, 12);
      await user.save();

      res.status(201).json({ message: "Signup complete. You can now log in."});
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, { errors: errors.array() });

      const email = req.body.email.toLowerCase();
      const { password } = req.body;

      const user = await User.findOne({ email });
      if (!user) throw createError(401, "Invalid credentials");

      if (!user.verifiedAt) {
        throw createError(403, "Please verify your email to continue.");
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) throw createError(401, "Invalid credentials");

      const accessToken = signAccessToken(user);

      res.json({
        user: { id: user._id, email: user.email, name: user.name },
        accessToken,
        expiresIn: 900
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;