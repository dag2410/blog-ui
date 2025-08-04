// commentAsync.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import commentService from "@/services/commentService";

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async ({ postId }) => {
    const response = await commentService.getAll(postId);
    return response.data;
  }
);

export const fetchComment = createAsyncThunk(
  "comments/fetchComment",
  async (id) => {
    const response = await commentService.getOne(id);
    return response.data;
  }
);

export const createComment = createAsyncThunk(
  "comments/createComment",
  async (data) => {
    const response = await commentService.create(data);
    return response.data;
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ id, data }) => {
    const response = await commentService.update(id, data);
    return response.data;
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (id) => {
    await commentService.del(id);
    return id;
  }
);
