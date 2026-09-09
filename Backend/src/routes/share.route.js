import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { shareChat, unshareChat, getSharedChat } from "../controllers/share.controller.js";

const shareRouter = Router();

// Private — owner actions
shareRouter.post("/chats/:chatId/share", authUser, shareChat);
shareRouter.delete("/chats/:chatId/share", authUser, unshareChat);

// Public — no auth needed
shareRouter.get("/share/:shareSlug", getSharedChat);

export default shareRouter;