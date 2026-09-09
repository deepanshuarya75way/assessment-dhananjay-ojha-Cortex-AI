import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat, shareChatApi, unshareChatApi } from "../service/chat.api";
import { setChats, setCurrentChatId, setLoading, createNewChat, addNewMessage, addMessages, setChatShared, removeChat } from "../chat.slice";
import { store } from "../../../app/app.store";
import { useDispatch } from "react-redux";

export const useChat = () => {
    const dispatch = useDispatch();

    function persistActiveChat(chatId) {
        if (chatId) {
            localStorage.setItem("perplexity-current-chat", chatId);
        } else {
            localStorage.removeItem("perplexity-current-chat");
        }
    }

    function handleSocketNewMessage(payload) {
        const { chatId, message } = payload || {};
        if (!chatId || !message) return;

        dispatch(addNewMessage({
            chatId,
            content: message.content,
            role: message.role,
            id: message.id ? String(message.id) : undefined,
        }));
    }

    async function handleSendMessage({ message, chatId }) {
        const live = store.getState().chat;
        const candidateChatId = chatId ?? live.currentChatId ?? localStorage.getItem("perplexity-current-chat");
        const resolvedChatId = candidateChatId && live.chats[candidateChatId] ? candidateChatId : null;
        dispatch(setLoading(true));

        const isExistingChat = Boolean(resolvedChatId);
        if (isExistingChat) {
            dispatch(addNewMessage({
                chatId: resolvedChatId,
                content: message,
                role: "user",
            }));
        }

        try {
            const data = await sendMessage({ message, chatId: resolvedChatId });
            const { chat, aiMessage } = data;

            const targetChatId = resolvedChatId || chat?._id;

            if (!isExistingChat && chat) {
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }));
                dispatch(addNewMessage({
                    chatId: chat._id,
                    content: message,
                    role: "user",
                }));
            }

            if (aiMessage && aiMessage.content) {
                dispatch(addNewMessage({
                    chatId: targetChatId,
                    content: aiMessage.content,
                    role: aiMessage.role,
                    id: String(aiMessage._id),
                }));
            }

            dispatch(setCurrentChatId(targetChatId));
            persistActiveChat(targetChatId);
        } catch (error) {
            console.error("handleSendMessage error:", error);
            const errorText = error.response?.status === 502
                ? "The AI service is temporarily unavailable. Please try again."
                : error.response?.data?.message || "Failed to send message. Please try again.";
            dispatch(addNewMessage({
                chatId: isExistingChat ? resolvedChatId : "new",
                content: errorText,
                role: "ai",
                id: `error-${Date.now()}`,
            }));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true));
        const data = await getChats();
        const { chats } = data;

        const normalizedChats = chats.reduce((acc, chat) => {
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                isShared: chat.isShared || false,
                shareSlug: chat.shareSlug || null,
                shareUrl: chat.shareUrl || null,
                lastUpdated: chat.updatedAt,
            };
            return acc;
        }, {});

        dispatch(setChats(normalizedChats));

        const savedChatId = localStorage.getItem("perplexity-current-chat");
        const firstChatId = Object.keys(normalizedChats)[0] || null;

        const live = store.getState().chat;
        const activeChatId =
            live.currentChatId && live.chats[live.currentChatId]
                ? live.currentChatId
                : savedChatId && normalizedChats[savedChatId]
                    ? savedChatId
                    : firstChatId;

        if (activeChatId) {
            dispatch(setCurrentChatId(activeChatId));
            persistActiveChat(activeChatId);
        }

        dispatch(setLoading(false));
        return normalizedChats;
    }

    async function handleOpenChat(chatId, chats) {
        if (chats[chatId]?.messages.length === 0) {
            const data = await getMessages(chatId);
            const { messages } = data;

            const formattedMessages = messages.map(msg => ({
                id: msg._id ? String(msg._id) : null,
                content: msg.content,
                role: msg.role,
            }));

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }));
        }
        dispatch(setCurrentChatId(chatId));
        persistActiveChat(chatId);
    }

    function handleCreateNewChat() {
        dispatch(setCurrentChatId(null));
        persistActiveChat(null);
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId);
            dispatch(removeChat(chatId));
        } catch (error) {
            console.error("handleDeleteChat error:", error);
        }
    }

    async function handleShareChat(chatId) {
        try {
            const data = await shareChatApi({ chatId });
            dispatch(setChatShared({
                chatId,
                isShared: true,
                shareSlug: data.shareSlug,
                shareUrl: data.shareUrl,
            }));
            return data.shareUrl;
        } catch (error) {
            console.error("handleShareChat error:", error);
            return null;
        }
    }

    async function handleUnshareChat(chatId) {
        try {
            await unshareChatApi({ chatId });
            dispatch(setChatShared({
                chatId,
                isShared: false,
                shareSlug: null,
                shareUrl: null,
            }));
        } catch (error) {
            console.error("handleUnshareChat error:", error);
        }
    }

    return {
        initializeSocketConnection,
        handleSocketNewMessage,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleCreateNewChat,
        handleDeleteChat,
        handleShareChat,
        handleUnshareChat,
    };
};