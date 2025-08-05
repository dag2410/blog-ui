import * as httpRequest from "@/utils/httpRequest";

export const getUser = async (id) => {
  const response = await httpRequest.get(`/users/${id}`);
  return response;
};
