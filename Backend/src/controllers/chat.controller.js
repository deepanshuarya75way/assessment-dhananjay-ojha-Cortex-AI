import { generateResponse, generateTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";  
import { getIO } from "../sockets/server.socket.js";

export async function sendMessage(req, res) {
    try {
        const { message, chat: chatId } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let title = null;
        let chat = null;

        if (!chatId) {
            title = await generateTitle(message);

            chat = await chatModel.create({
                user: req.user.id,
                title,
            });

            if (!chat) {
                console.error("sendMessage: chat creation returned undefined", { body: req.body, user: req.user });
                return res.status(500).json({ message: 'Failed to create chat' });
            }
        }

        const targetChatId = chatId || chat?._id;
        if (!targetChatId) {
            console.error("sendMessage: missing targetChatId", { body: req.body, chat, user: req.user });
            return res.status(400).json({ message: 'Chat ID is required or chat creation failed' });
        }

        const userMessage = await messageModel.create({
            chat: targetChatId,
            content: message,
            role: "user",
        });

        const messages = await messageModel.find({
            chat: targetChatId,
        });

        const result = await generateResponse(messages);

        const aiMessage = await messageModel.create({
            chat: targetChatId,
            content: result,
            role: "ai",
        });

        // Emit the new AI message only to the sender's own sockets
        try {
            const io = getIO();
            io.to(`user:${req.user.id}`).emit("newMessage", {
                chatId: targetChatId,
                message: {
                    id: aiMessage._id,
                    content: aiMessage.content,
                    role: aiMessage.role,
                }
            });
        } catch (err) {
            console.error("Socket emit failed:", err);
        }

        res.status(201).json({
            title,
            chat,
            aiMessage,
        });
    } catch (error) {
        console.error(error);

        // If the AI provider is unreachable/misconfigured, tell the user clearly
        // instead of leaking an internal 500 ("AI response failed" is enough).
        const isAiError = /api key|api_key|unauthorized|401|403|429|genai|permission/i.test(error?.message || "");

        res.status(isAiError ? 502 : 500).json({
            message: isAiError
                ? "The AI service could not process your request right now. Please check the API configuration."
                : "Something went wrong while sending your message.",
        });
    }
}


export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}