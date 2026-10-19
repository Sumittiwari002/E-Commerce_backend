import jwt from "jsonwebtoken";

// 7 days in seconds / milliseconds (keep in sync with JWT_REFRESH_EXPIRES_IN)
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_TTL_MS = REFRESH_TTL_SECONDS * 1000;

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

// sessionId becomes the JWT "jti" claim -> every login gets its own unique token
const generateRefreshToken = (userId, sessionId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    jwtid: sessionId,
  });
};

// Redis key: one key PER LOGIN SESSION (not one per user)
const refreshKey = (userId, sessionId) => `refreshToken:${userId}:${sessionId}`;

// Same options must be used for res.cookie() and res.clearCookie()
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export {
  generateAccessToken,
  generateRefreshToken,
  refreshKey,
  refreshCookieOptions,
  REFRESH_TTL_SECONDS,
  REFRESH_TTL_MS,
};