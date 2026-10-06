import { redisClient } from "../config/redis.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
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
  } catch (error) {
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
    const refreshToken = generateRefreshToken(user._id);

    console.log(accessToken);
    console.log(refreshToken);

    await redisClient.set(`refreshToken:${user._id}`, refreshToken, {
      EX: 7 * 24 * 60 * 60,
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
        },
        accessToken,
        refreshToken,
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
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    console.log("Decoded value:", decoded);

    const userId = decoded.userId;

    // Get refresh token from Redis
    const storedToken = await redisClient.get(
      `refreshToken:${userId}`
    );

    console.log("Redis Token =", storedToken);
    console.log("Request Token =", refreshToken);

    // Check whether token exists in Redis
    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found or expired",
      });
    }

    // Compare tokens
    if (storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Check whether user still exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken,
      },
    });

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
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
 const logout = async function (req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      //Verify  refresh token

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const userId = decoded.userId;

      //Delete refresh token from Redis

      await redisClient.del(`refreshToken:${userId}`);

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(200).json({
          success: true,
          message: "Logout successful",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh Token",
        });
      }

      console.error("Logout Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

export { register, login, refreshAccessToken, logout };
