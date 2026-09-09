import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
    if (!env.mongoUri) {
        throw new Error("MONGODB_URI is not configured. Set it in your environment variables (.env).");
    }

    const conn = await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 15000, // fail fast if the cluster is unreachable
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    try {
        await conn.connection.collection("chats").dropIndex("shareSlug_1");
        console.log("Dropped legacy duplicate shareSlug index");
    } catch (error) {
        if (error.code !== 27) {
            console.warn("shareSlug index cleanup warning:", error.message);
        }
    }
};

export default connectDB;