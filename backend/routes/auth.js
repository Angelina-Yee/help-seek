import express from "express";
import { body, validationResult } from "express-validator";
import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";

//router handling signup and login
const router = express.Router();

//email ends with @ucsd.edu
function ucsdOnly(email) {
  return typeof email === "string" && email.toLowerCase().endsWith("@ucsd.edu");
}

//generate random 5-digit OTP code
function makeOtp() {
  return String(Math.floor(Math.random() * 100000)).padStart(5, "0");
}

//create temp JWT tokens
function signSignupToken(email) {
  return jwt.sign({ typ: "signup", email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "30m",
  });
}


//access token for logged in users
function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
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
      }

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

//verify code enteredd by the user
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
      }

      if (otp.code !== code) {
        otp.attempts = (otp.attempts || 0) + 1;
        await otp.save();
        if (otp.attempts >= 5) {
          await Otp.deleteOne({ _id: otp._id });
          throw createError(429, "Too many attempts. Request a new code.");
        }
        throw createError(401, "Invalid code.");
      }

      const signupToken = signSignupToken(email);

      res.json({ message: "Email verified", next: "complete", signupToken });
    } catch (err) {
      next(err);
    }
  }
);

//sign up complete: set name and password
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

//login with email and password
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

      res.status(201).json({
        message: "Signup successful",
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