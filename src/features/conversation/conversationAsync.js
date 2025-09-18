import conversationService from "@/services/conversationService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createConversations = createAsyncThunk(
  "createConversations/createConversations",
  async ({ participantIds, name, avatar }) => {
    const response = await conversationService.createConversation(
      participantIds,
      name,
      avatar
    );
    return response.data;
  }
);

export const fetchConversations = createAsyncThunk(
  "conversations/fetchConversations",
  async () => {
    const response = await conversationService.getConversations();
    return response.data;
  }
);

export const fetchConversation = createAsyncThunk(
  "conversations/fetchConversation",
  async (conversationId) => {
    const response = await conversationService.getConversationById(
      conversationId
    );
    return response.data;
  }
);

export const createMessage = createAsyncThunk(
  "conversations/createMessage",
  async ({ conversationId, content, type }) => {
    const response = await conversationService.sendMessage(
      conversationId,
      content,
      type
    );
    return response.data;
  }
);

export const markRead = createAsyncThunk(
  "conversations/markRead",
  async (conversationId) => {
    const response = await conversationService.markAsRead(conversationId);
    return response.data;
  }
);
