import * as httpRequest from "@/utils/httpRequest";

export const getUser = async (id) => {
  const response = await httpRequest.get(`/users/${id}`);
  return response;
};

export const updateUser = async (id, data) => {
  const response = await httpRequest.put(`/users/${id}`, data);
  return response;
};
