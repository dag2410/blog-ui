import * as httpRequest from "@/utils/httpRequest";

export const changePassword = async (data) => {
  const response = await httpRequest.put("/settings/change-password", data);
  return response;
};

export const toggleTwoFactor = async (data) => {
  const response = await httpRequest.put("/settings/two-factor", data);
  return response;
};
