import { createAsyncThunk } from "@reduxjs/toolkit";
import * as uploadService from "@/services/uploadService";

export const uploadAvatar = createAsyncThunk("upload/avatar", async (file) => {
  const response = await uploadService.uploadAvatar(file);
  return response.data;
});

export const uploadCover = createAsyncThunk(
  "upload/cover_image",
  async (file) => {
    const response = await uploadService.uploadCover(file);
    return response.data;
  }
);

export const uploadImage = createAsyncThunk("upload/image", async (file) => {
  const response = await uploadService.uploadImage(file);
  return response.data;
});
