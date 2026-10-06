import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import {getProfile, passwordUpdate} from "../controllers/userController.js";

const router = express.Router();

router
.get("/profile", authMiddleware, getProfile)
.post("/password", authMiddleware, passwordUpdate);
export default router;
