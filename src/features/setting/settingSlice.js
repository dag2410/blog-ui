import { createSlice } from "@reduxjs/toolkit";
import { changePassword, toggleTwoFactor } from "./settingAsync";

const initialState = {
  userSettings: null,
  loading: false,
  error: null,
  successMessage: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(toggleTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleTwoFactor.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Two-factor authentication updated";
        state.userSettings = {
          ...state.userSettings,
          twoFactorEnabled: action.payload,
        };
      })
      .addCase(toggleTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearMessages } = settingsSlice.actions;
export default settingsSlice.reducer;
