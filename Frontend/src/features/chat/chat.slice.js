import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload;
      state.chats[chatId] = {
        id: chatId,
        title,
        messages: [],
        isShared: false,
        shareSlug: null,
        shareUrl: null,
        lastUpdated: new Date().toISOString(),
      };
    },
    addNewMessage: (state, action) => {
      const { chatId, content, role, sources, searched, id } = action.payload;

      if (!chatId || !state.chats[chatId]) {
        return;
      }

      // The same AI reply can arrive both in the REST response and via the
      // socket "newMessage" event. Deduplicate by message id so it only
      // renders once, no matter which channel wins the race.
      if (id && state.chats[chatId].messages.some((msg) => msg.id && msg.id === id)) {
        return;
      }

      state.chats[chatId].messages.push({
        id: id || null,
        content,
        role,
        sources: sources || null,
        searched: searched || false,
      });
      state.chats[chatId].lastUpdated = new Date().toISOString();
    },
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.chats[chatId].messages = messages;
    },
    setChats: (state, action) => {
      const fetched = action.payload;

      // Merge instead of blindly replacing. On the initial login load this
      // request can resolve AFTER the user has already sent their first
      // message. If we replace the whole chats map here, we would wipe the
      // brand-new chat (and the just-generated reply) the user created while
      // the fetch was in flight - even though it was saved to the database.
      // Preserve anything already in memory that is still in use.
      const merged = { ...fetched };

      for (const id of Object.keys(state.chats)) {
        const existing = state.chats[id];
        const hasData = (existing?.messages?.length > 0) || existing?.id === state.currentChatId;
        if (hasData && !merged[id]) {
          merged[id] = existing;
        }
      }

      // Keep messages we already loaded for chats that also come back from the
      // server, so a fresh fetch never empties a conversation on screen.
      for (const id of Object.keys(fetched)) {
        const existing = state.chats[id];
        if (existing?.messages?.length) {
          merged[id] = { ...fetched[id], messages: existing.messages };
        }
      }

      state.chats = merged;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setChatShared: (state, action) => {
      const { chatId, isShared, shareSlug, shareUrl } = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId].isShared = isShared;
        state.chats[chatId].shareSlug = shareSlug;
        state.chats[chatId].shareUrl = shareUrl;
      }
    },
    removeChat: (state, action) => {
      const chatId = action.payload;
      delete state.chats[chatId];
      if (state.currentChatId === chatId) state.currentChatId = null;
    },
  },
});

export const {
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  addNewMessage,
  addMessages,
  setChatShared,
  removeChat,
} = chatSlice.actions;
export default chatSlice.reducer;