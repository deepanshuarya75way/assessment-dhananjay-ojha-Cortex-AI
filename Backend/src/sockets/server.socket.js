import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import env from "../config/env.js";

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: env.corsOrigins,
            credentials: true,
        }
    })

    console.log("Socket.io initialized");

    io.on("connection", (socket) => {
        // Authenticate the socket with the same JWT cookie used by the REST
        // API and join a per-user room so AI replies are only delivered to
        // the user who sent the message (and their own devices), not everyone.
        try {
            const cookies = socket.handshake.headers.cookie
                ? cookie.parse(socket.handshake.headers.cookie)
                : {};

            const token = cookies.token;

            if (token) {
                const decoded = jwt.verify(token, env.jwtSecret);
                socket.join(`user:${decoded.id}`);
            }
        } catch (err) {
            // Ignore auth failures silently - the socket simply won't join a room.
        }
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}