import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import projectRoutes from "./routes/projectRoute.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { connectRedis } from "./config/redis.js";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/brand", projectRoutes);
app.use("/api/category", projectRoutes);
app.use("/api/product", projectRoutes);

// Static assets
app.use(
  "/assets",
  express.static(path.join(process.cwd(), "assets"))
);

// Initialize database and Redis before handling requests
let initPromise;

const initializeServices = async () => {
  if (!initPromise) {
    initPromise = Promise.all([
      connectDB(),
      connectRedis()
    ]);
  }

  return initPromise;
};

app.use(async (req, res, next) => {
  try {
    await initializeServices();
    next();
  } catch (error) {
    console.error("Service initialization failed:", error);
    res.status(500).json({
      success: false,
      message: "Server initialization failed"
    });
  }
});

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce Backend API is running"
  });
});

// IMPORTANT: Export Express app for Vercel
export default app;

// Local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 9000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
