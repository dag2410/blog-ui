import * as httpRequest from "@/utils/httpRequest";

export const toggleBookmark = async (data) => {
  const response = await httpRequest.post("/bookmarks", data);
  return response;
};

export const getBookmarkByUser = async (data) => {
  const response = await httpRequest.get("/bookmarks", data);
  return response;
};

export const deleteBookmarkUser = async (data) => {
  const response = await httpRequest.del("/bookmarks", data);
  return response;
};

export default {
  toggleBookmark,
  getBookmarkByUser,
  deleteBookmarkUser,
};
