import * as httpRequest from "@/utils/httpRequest";

export const getAll = async (userId) => {
  const response = await httpRequest.get("/notifications");
  return response;
};

export const create = async (data) => {
  const response = await httpRequest.post("/notifications", data);
  return response;
};

export const del = async (id) => {
  const response = await httpRequest.del(`/notifications/${id}`);
  return response;
};
export const markAsRead = async (id) => {
  return await httpRequest.patch(`/notifications/read`, { id });
};

export const markAllAsRead = async () => {
  return await httpRequest.patch(`/notifications/read-all`);
};

export default {
  getAll,
  create,
  del,
  markAsRead,
  markAllAsRead,
};
