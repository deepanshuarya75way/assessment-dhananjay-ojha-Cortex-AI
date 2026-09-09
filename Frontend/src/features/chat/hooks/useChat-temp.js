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
            if (error.response?.status === 502) {
                dispatch(addNewMessage({
                    chatId: resolvedChatId || "new",
                    content: "AI service is temporarily unavailable. Please try again.",
                    role: "ai",
                    id: `error-${Date.now()}`,
                }));
            } else {
                dispatch(addNewMessage({
                    chatId: resolvedChatId || "new",
                    content: "Failed to send message. Please try again.",
                    role: "ai",
                    id: `error-${Date.now()}`,
                }));
            }
        } finally {
            dispatch(setLoading(false));
        }
    }se));
        }
    }ctiveChat(targetChatId);
        } catch (error) {
            console.error("handleSendMessage error:", error);
            // Show error message to user so they know what happened
            if (error.response?.status === 502) {
