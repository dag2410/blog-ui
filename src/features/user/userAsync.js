import { createAsyncThunk } from "@reduxjs/toolkit";
import * as userService from "@/services/userService";

export const fetchUser = createAsyncThunk("users/fetchOne", async (id) => {
  const response = await userService.getUser(id);
  return response.data;
});
