import * as httpRequest from "@/utils/httpRequest";

export const createAIChat = async (userId, role = "user", content) => {
  const response = await httpRequest.post("/ai/chat", {
    userId,
    role,
    content,
  });
  return response.data;
};

export const getAIChat = async () => {
  const response = await httpRequest.get("/ai/chat/history");
  return response.data;
};

export default { createAIChat, getAIChat };
