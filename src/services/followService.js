import * as httpRequest from "@/utils/httpRequest";

const toggleFollow = async (data) => {
  const response = await httpRequest.post("/follows", data);
  return response;
};

const getFollowing = async (userId) => {
  const response = await httpRequest.get(`/follows/following/${userId}`);
  return response;
};

const getFollowers = async (userId) => {
  const response = await httpRequest.get(`/follows/followers/${userId}`);
  return response;
};

export default {
  toggleFollow,
  getFollowing,
  getFollowers,
};
