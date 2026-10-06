import express from "express";
import cors from 'cors';
import connectDB from "./config/db.js";
import projectRoutes from "./routes/projectRoute.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import {connectRedis} from "./config/redis.js";
import path from 'path';
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/brand", projectRoutes);
app.use("/api/category", projectRoutes);
app.use("/api/product", projectRoutes);
app.use(
  "/assets",
  express.static(path.join(process.cwd(), "assets"))
);

const startServer = async()=> {
    try{
        await connectDB();
        await connectRedis();

        app.listen(process.env.PORT, ()=>{
            console.log("server running");
            
        });
        }
        catch(error){
            console.error("Server startup failed:", error.message);
            process.exit(1);
        }
    }

startServer();