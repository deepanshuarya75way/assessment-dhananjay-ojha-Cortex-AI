import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3002",
    withCredentials: true,
})


export const sendMessage = async ({ message, chatId }) => {
    const response = await api.post("/api/chats/message", { message, chat: chatId })
    return response.data
}

export const getChats = async () => {
    const response = await api.get("/api/chats")
    return response.data
}

export const getMessages = async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`)
    return response.data
}

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`)
    return response.data
}

export const shareChatApi = async ({ chatId }) => {
  const response = await api.post(`/api/chats/${chatId}/share`);
  return response.data;
}

export const unshareChatApi = async ({ chatId }) => {
  const response = await api.delete(`/api/chats/${chatId}/share`);
  return response.data;
};

export const getSharedChatApi = async ({ shareSlug }) => {
  const response = await api.get(`/api/share/${shareSlug}`);
  return response.data;
};