import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { nanoid } from "nanoid";
import env from "../config/env.js";

/**
 * @route POST /api/chats/:chatId/share
 * @desc Generate a public share link for a chat
 * @access Private
 */
export async function shareChat(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
    if (!chat)
      return res
        .status(404)
        .json({ message: "Chat not found", success: false });

    // Already shared — return existing slug
    if (chat.isShared && chat.shareSlug) {
      return res.status(200).json({
        success: true,
        shareUrl: `${env.frontendUrl}/share/${chat.shareSlug}`,
        shareSlug: chat.shareSlug,
      });
    }

    // Generate new unique slug
    const shareSlug = nanoid(10); // e.g. "V1StGXR8_Z"

    chat.isShared = true;
    chat.shareSlug = shareSlug;
    await chat.save();

    res.status(200).json({
      success: true,
      message: "Chat is now public",
      shareUrl: `${env.frontendUrl}/share/${shareSlug}`,
      shareSlug,
    });
  } catch (err) {
    console.error("shareChat error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

/**
 * @route DELETE /api/chats/:chatId/share
 * @desc Revoke public access — chat becomes private again
 * @access Private
 */
export async function unshareChat(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
    if (!chat)
      return res
        .status(404)
        .json({ message: "Chat not found", success: false });

    chat.isShared = false;
    chat.shareSlug = null;
    await chat.save();

    res.status(200).json({ success: true, message: "Chat is now private" });
  } catch (err) {
    console.error("unshareChat error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

/**
 * @route GET /api/share/:shareSlug
 * @desc Get a publicly shared chat — no auth needed
 * @access Public
 */
export async function getSharedChat(req, res) {
  try {
    const { shareSlug } = req.params;

    const chat = await chatModel
      .findOne({ shareSlug, isShared: true })
      .populate("user", "username"); // owner ka username dikhao

    if (!chat) {
      return res
        .status(404)
        .json({
          message: "Shared chat not found or link revoked",
          success: false,
        });
    }

    const messages = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .select("role content createdAt"); // password etc. nahi

    res.status(200).json({
      success: true,
      chat: {
        title: chat.title,
        createdAt: chat.createdAt,
        owner: chat.user.username,
      },
      messages,
    });
  } catch (err) {
    console.error("getSharedChat error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}