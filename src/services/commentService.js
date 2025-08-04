import * as httpRequest from "@/utils/httpRequest";

export const getAll = async (postId) => {
  const response = await httpRequest.get("/comments", {
    params: { postId },
  });
  return response;
};

export const getOne = async (id) => {
  const response = await httpRequest.get(`/comments/${id}`);
  return response;
};

export const create = async (data) => {
  const response = await httpRequest.post("/comments", data);
  return response;
};

export const update = async (id, data) => {
  const response = await httpRequest.put(`/comments/${id}`, data);
  return response;
};

export const del = async (id) => {
  const response = await httpRequest.del(`/comments/${id}`);
  return response;
};

export default {
  getAll,
  getOne,
  create,
  update,
  del,
};
