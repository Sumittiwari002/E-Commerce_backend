import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";

const startServer = async () => {
  try {
    await connectDB();
    // console.log("MongoDB connected successfully");

    await connectRedis();
    // console.log("Redis connected successfully");

    const PORT = process.env.PORT || 9000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
