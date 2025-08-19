import { createAsyncThunk } from "@reduxjs/toolkit";
import * as userService from "@/services/userService";

export const fetchUser = createAsyncThunk("users/fetchOne", async (id) => {
  const response = await userService.getUser(id);
  return response.data;
});

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }) => {
    const response = await userService.updateUser(id, data);
    return response.data;
  }
);
