import "dotenv/config";
import app from "./src/app.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";
import connectDB from "./src/config/database.js";
import env from "./src/config/env.js";

const httpServer = http.createServer(app);

initSocket(httpServer);

connectDB()
.catch((err) => {
    console.error("MongoDb connection failed:", err);
    process.exit(1);
});

httpServer.listen(env.port, () => {
    console.log(`Server is running on port ${env.port} (${env.NODE_ENV})`);
});

httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${env.port} is already in use. Stop the process using that port or set a different PORT.`);
    } else {
        console.error("Server failed to start:", err);
    }
    process.exit(1);
});

// Graceful shutdown so deployments (and nodemon restarts) never leave
// orphaned connections holding the port open.
const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    httpServer.close(() => process.exit(0));
    // Give open connections up to 10s to finish, then force exit.
    setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));