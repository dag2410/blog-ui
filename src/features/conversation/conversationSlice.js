// src/features/conversation/conversationSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createConversations,
  fetchConversations,
  fetchConversation,
  createMessage,
  markRead,
} from "./conversationAsync";

const initialState = {
  items: [],
  current: null,
  isLoading: false,
  error: null,
  message: null,
};

const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    clearConversationMessage: (state) => {
      state.message = null;
    },
    clearConversationError: (state) => {
      state.error = null;
    },
    clearCurrentConversation: (state) => {
      state.current = null;
    },
    addRealtimeMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (state.current && state.current.id === conversationId) {
        state.current.messages.push(message);
      }
      const conv = state.items.find((c) => c.id === conversationId);
      if (conv) {
        conv.messages = [message];
        conv.last_message_at = message.createdAt;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(createConversations.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.current = action.payload;
        state.message = "Tạo cuộc trò chuyện thành công.";
      })

      .addCase(createMessage.fulfilled, (state, action) => {
        const message = action.payload;
        if (state.current && state.current.id === message.conversation_id) {
          state.current.messages.push(message);
        }
        const conv = state.items.find((c) => c.id === message.conversation_id);
        if (conv) {
          conv.messages = [message];
          conv.last_message_at = message.createdAt;
        }
      })

      .addCase(markRead.fulfilled, (state, action) => {
        const message = action.payload;
        if (state.current) {
          const msg = state.current.messages.find((m) => m.id === message.id);
          if (msg) msg.read_at = message.read_at;
        }
      });
  },
});

export const {
  clearConversationMessage,
  clearConversationError,
  clearCurrentConversation,
  addRealtimeMessage,
} = conversationSlice.actions;

export default conversationSlice.reducer;
