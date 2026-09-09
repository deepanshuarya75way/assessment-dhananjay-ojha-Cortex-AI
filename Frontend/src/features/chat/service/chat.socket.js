import { io } from "socket.io-client";

let socket;

export const initializeSocketConnection = (onNewMessage) => {
    if (socket && socket.connected) {
        if (typeof onNewMessage === "function") {
            socket.off("newMessage");
            socket.on("newMessage", onNewMessage);
        }
        return socket;
    }

    socket = io(import.meta.env.VITE_API_URL || "http://localhost:3002", {
        withCredentials: true,
        transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
    });

    socket.on("disconnect", () => {
        console.log("Socket.IO disconnected");
    });

    if (typeof onNewMessage === "function") {
        socket.on("newMessage", onNewMessage);
    }

    return socket;
};