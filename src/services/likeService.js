// src/services/likeApi.js
import * as httpRequest from "@/utils/httpRequest";

export const toggleLike = async (data) => {
  const response = await httpRequest.post("/likes", data);
  return response;
};

export default {
  toggleLike,
};
