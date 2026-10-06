import express from "express";
import cors from "cors";
import projectRoutes from "./routes/projectRoute.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/assets",
  express.static(path.join(process.cwd(), "assets"))
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/brand", projectRoutes);
app.use("/api/category", projectRoutes);
app.use("/api/product", projectRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce Backend API is running"
  });
});

export default app;
