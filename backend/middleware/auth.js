import jwt from "jsonwebtoken";
import createError from "http-errors";

//Use JWT to authenticate requests
export default function auth(req, _res, next) {

  //Read token from Authorization header
  try {
    const hdr = req.headers.authorization || "";
    const bearer = hdr.startsWith("Bearer ") ? hdr.slice(7).trim() : null;

    //No header read token from cookies
    const cookieHeader = req.headers.cookie || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const i = c.indexOf("=");
        if (i === -1) return [c.trim(), ""];
        return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1))];
      }).filter(([k]) => k)
    );
    const cookieToken = cookies.token || cookies.access_token || null;

    //Choose availabe token source
    const token = bearer || cookieToken;
    if (!token) throw createError(401, "Missing auth token");

    //Verify token
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    //Extract user ID
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) throw createError(401, "Invalid token payload");

    //Attatch user info to request
    req.user = { id: userId, email: payload.email || null };

    //Continue request
    next();
  } catch (err) {
    if (!err.status) err = createError(401, "Invalid or expired token");
    next(err);
  }
}