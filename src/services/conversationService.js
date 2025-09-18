import * as httpRequest from "@/utils/httpRequest";

const createConversation = async (participantIds, name, avatar) => {
  const response = await httpRequest.post("/conversations", {
    participantIds,
    name,
    avatar,
  });
  return response;
};

const getConversations = async () => {
  const response = await httpRequest.get("/conversations");
  return response;
};

const getConversationById = async (conversationId) => {
  const response = await httpRequest.get(`/conversations/${conversationId}`);
  return response;
};

const sendMessage = async (conversationId, content, type) => {
  const response = await httpRequest.post(
    `/conversations/${conversationId}/message`,
    {
      content,
      type,
    }
  );
  return response;
};

const markAsRead = async (conversationId) => {
  const response = await httpRequest.put(
    `/conversations/${conversationId}/message/read`
  );
  return response;
};

export default {
  createConversation,
  getConversations,
  getConversationById,
  sendMessage,
  markAsRead,
};
