import { createSlice } from "@reduxjs/toolkit";
import { uploadAvatar, uploadCover, uploadImage } from "./uploadAsync";

const initialState = {
  url: null,
  isLoading: false,
  error: null,
  message: null,
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUrl: (state) => {
      state.url = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.url = action.payload.url;
        state.message = "Đăng avatar thành công!";
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(uploadCover.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadCover.fulfilled, (state, action) => {
        state.isLoading = false;
        state.url = action.payload.url;
        state.message = "Đăng ảnh bìa thành công!";
      })
      .addCase(uploadCover.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(uploadImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.url = action.payload.url;
        state.message = "Đăng ảnh bài viết thành công!";
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearMessage, clearError, clearUrl } = uploadSlice.actions;

export default uploadSlice.reducer;
