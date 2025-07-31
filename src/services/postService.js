import * as httpRequest from "@/utils/httpRequest";

export const getAll = async ({ topic, page = 1, limit = 10 }) => {
  const response = await httpRequest.get("/posts", {
    params: {
      topic,
      page,
      limit,
    },
  });
  return response;
};

export const getOne = async (slug) => {
  const response = await httpRequest.get(`/posts/${slug}`);
  return response;
};

export const create = async (data) => {
  const response = await httpRequest.post("/posts", data);
  return response;
};

export const update = async (slug, data) => {
  const response = await httpRequest.put(`/posts/${slug}`, data);
  return response;
};

export const del = async (slug) => {
  const response = await httpRequest.del(`/posts/${slug}`);
  return response;
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
  const response = await httpRequest.get(`/posts/user/${userId}`, {
    params: { page, limit },
  });
  return response;
};

export const getFeaturedPosts = async () => {
  const response = await httpRequest.get("/posts/featured");
  return response;
};

export const getRecentPosts = async () => {
  const response = await httpRequest.get("/posts/recent");
  return response;
};

export const getRelatedPosts = async ( topicId, excludeSlug) => {
  const response = await httpRequest.get("/posts/related", {
    params: {
      topicId,
      excludeSlug,
    },
  });
  return response;
};
