import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import cors from "cors";
import shareRouter from "./routes/share.route.js";
import env from "./config/env.js";

const app = express();

// Behind a reverse proxy (nginx, Render, Railway...), trust the X-Forwarded-*
// headers so req.protocol / secure cookies work correctly in production.
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
    origin: env.corsOrigins,
    credentials: true,
    methods: [ "GET", "POST", "PUT", "DELETE" ],
}))

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);
app.use("/api", shareRouter);

export default app;