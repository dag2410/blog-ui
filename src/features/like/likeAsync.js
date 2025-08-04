import { createAsyncThunk } from "@reduxjs/toolkit";
import likeService from "@/services/likeService";

export const toggleLike = createAsyncThunk(
  "likes/toggleLike",
  async ({ likeable_type, likeable_id }) => {
    const response = await likeService.toggleLike({
      likeable_type,
      likeable_id,
    });
    return response.data;
  }
);
