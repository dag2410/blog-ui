import { createAsyncThunk } from "@reduxjs/toolkit";
import * as settingService from "@/services/settingService";

export const changePassword = createAsyncThunk(
  "settings/changePassword",
  async ({ currentPassword, newPassword }) => {
    const response = await settingService.changePassword({
      currentPassword,
      newPassword,
    });
    return response.data;
  }
);

export const toggleTwoFactor = createAsyncThunk(
  "settings/toggleTwoFactor",
  async ({ enabled }) => {
    const response = await settingService.toggleTwoFactor({ enabled });
    return response.data;
  }
);
