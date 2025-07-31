import * as httpRequest from "@/utils/httpRequest";

export const getCurrentUser = async () => {
  const response = await httpRequest.get("/auth/profile");
  return response;
};

export const postRegister = async (formData) => {
  const response = await httpRequest.post("/auth/register", formData);
  return response;
};

export const postLogIn = async (email, password) => {
  const response = await httpRequest.post("/auth/login", { email, password });
  return response;
};

export const postLogOut = async () => {
  const response = await httpRequest.post("/auth/logout");
  httpRequest.clearToken();
  return response;
};

export const refreshToken = async () => {
  const response = await httpRequest.post("/auth/refresh");
  return response;
};

export const sendForgotPasswordEmail = async (email) => {
  const response = await httpRequest.post("/auth/forgot-password", email);
  return response;
};

export const verifyResetToken = async (token) => {
  const response = await httpRequest.get("/auth/reset-password", {
    params: {
      token,
    },
  });
  return response;
};

export const resetPassword = async (token, password) => {
  const response = await httpRequest.post("/auth/reset-password", {
    token,
    password,
  });
  return response;
};

export const verifyEmail = async (token) => {
  const response = await httpRequest.get("/auth/verify-email", {
    params: {
      token,
    },
  });
  return response;
};

export default {
  getCurrentUser,
  postRegister,
  postLogOut,
  postLogIn,
  refreshToken,
  sendForgotPasswordEmail,
  verifyResetToken,
  resetPassword,
  verifyEmail,
};
