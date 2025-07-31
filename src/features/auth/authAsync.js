import authService from "@/services/authService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    const res = await authService.getCurrentUser();
    return res.data;
  }
);

export const postRegister = createAsyncThunk(
  "auth/postRegister",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await authService.postRegister(formData);
      return result;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: error.message || "Network error",
        errors: [],
      });
    }
  }
);

export const postLogIn = createAsyncThunk(
  "auth/postLogIn",
  async ({ email, password }) => {
    const res = await authService.postLogIn(email, password);
    return res.data;
  }
);

export const postLogOut = createAsyncThunk("auth/postLogOut", async () => {
  const res = await authService.postLogOut();
  return res.data;
});

export const refreshToken = createAsyncThunk("auth/refreshToken", async () => {
  const res = await authService.refreshToken();
  return res.data;
});

export const sendForgotPasswordEmail = createAsyncThunk(
  "auth/sendForgotPasswordEmail",
  async (email) => {
    const res = await authService.sendForgotPasswordEmail(email);
    return res.data;
  }
);

export const verifyResetToken = createAsyncThunk(
  "auth/verifyResetToken",
  async (token) => {
    const res = await authService.verifyResetToken(token);
    return res.data;
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }) => {
    const res = await authService.resetPassword(token, password);
    return res.data;
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token) => {
    const res = await authService.verifyEmail(token);
    return res.data;
  }
);
