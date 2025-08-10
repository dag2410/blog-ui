import { createAsyncThunk } from "@reduxjs/toolkit";
import followService from "@/services/followService";

export const toggleFollow = createAsyncThunk(
  "follows/toggleFollow",
  async ({ followed_id }) => {
    const response = await followService.toggleFollow({ followed_id });
    return response.data;
  }
);

export const fetchFollowing = createAsyncThunk(
  "follows/fetchFollowing",
  async (userId) => {
    const response = await followService.getFollowing(userId);
    return response.data;
  }
);

export const fetchFollowers = createAsyncThunk(
  "follows/fetchFollowers",
  async (userId) => {
    const response = await followService.getFollowers(userId);
    return response.data;
  }
);
