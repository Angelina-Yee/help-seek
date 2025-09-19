import jwt from "jsonwebtoken";
import createError from "http-errors";

// Authenticate requests with a 1-day JWT access token
export default function auth(req, _res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const bearer = hdr.startsWith("Bearer ") ? hdr.slice(7).trim() : null;

    // Parse cookies
    const cookieHeader = req.headers.cookie || "";
    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => {
          const i = c.indexOf("=");
          if (i === -1) return [c.trim(), ""];
          return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1))];
        })
        .filter(([k]) => k)
    );
    
    //Suppport both names
    const cookieToken = cookies.access_token || cookies.token || null;

    // Get token from Authorization cookies
    const token = bearer || cookieToken;
    if (!token) throw createError(401, "Missing auth token");

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach user info to request
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) throw createError(401, "Invalid token payload");
    req.user = { id: userId, email: payload.email || null };
    next();
  } catch (err) {
    if (!err.status) err = createError(401, "Invalid or expired token");
    next(err);
  }
}