import { redisClient } from "../config/redis.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  refreshKey,
  refreshCookieOptions,
  REFRESH_TTL_SECONDS,
  REFRESH_TTL_MS,
} from "../utils/tokenUtils.js";

const register = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    // console.log(name, mobile, email, password);

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const existingEmail = await User.findOne({ email });
    console.log(existingEmail);

    // return ;

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      mobile,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
        },
      },
    });
  } 
   catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    console.log("User found:", user);

    // return;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log("Password Valid", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user._id);

    // every login = its own session id, so a 2nd login (frontend, another
    // Postman tab, phone...) no longer overwrites / invalidates this one
    const sessionId = crypto.randomUUID();
    const refreshToken = generateRefreshToken(user._id, sessionId);

    await redisClient.set(refreshKey(user._id, sessionId), refreshToken, {
      EX: REFRESH_TTL_SECONDS,
    });

    res.cookie("refreshToken", refreshToken, {
      ...refreshCookieOptions,
      maxAge: REFRESH_TTL_MS,
    });

    // Login successful
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          status: user.status,
        },
        accessToken,
        // refreshToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    // cookie (browser / Postman cookie jar) first, body as fallback
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // 1. Signature + expiry check (throws if bad)
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { userId, jti } = decoded;

    // Tokens issued before this change have no jti -> force a fresh login
    if (!jti) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is outdated, please login again",
      });
    }

    // 2. Is this exact session still stored in Redis?
    const storedToken = await redisClient.get(refreshKey(userId, jti));

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired or logged out, please login again",
      });
    }

    if (storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token does not match stored session",
      });
    }

    // 3. User still exists?
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // 4. Issue a new access token
    const accessToken = generateAccessToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired, please login again",
      });
    }

    if (error.name === "JsonWebTokenError") {
      // e.g. "invalid signature" -> token signed with a different JWT_REFRESH_SECRET
      console.log("Refresh JWT error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    console.error("Refresh Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    // logout must work from the cookie too - the browser can't read httpOnly cookies
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (decoded.jti) {
          await redisClient.del(refreshKey(decoded.userId, decoded.jti));
        }
      } catch (err) {
        // expired / invalid token -> nothing to delete in Redis, still clear cookie
      }
    }

    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { register, login, refreshAccessToken, logout };