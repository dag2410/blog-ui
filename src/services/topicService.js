import * as httpRequest from "@/utils/httpRequest";

export const getAll = async () => {
  const response = await httpRequest.get("/topics");
  return response;
};

export const getOne = async (slug) => {
  const response = await httpRequest.get(`/topics/${slug}`);
  return response;
};
export const create = async (data) => {
  const response = await httpRequest.post("/topics", data);
  return response;
};
export const update = async (slug, data) => {
  const response = await httpRequest.put(`/topics/${slug}`, data);
  return response;
};
export const del = async (slug) => {
  const response = await httpRequest.del(`/topics/${slug}`);
  return response;
};

export const getTrendingTopics = async (slug) => {
  const response = await httpRequest.get(`/topics/trending`);
  return response;
};
