import { createAsyncThunk } from "@reduxjs/toolkit";
import * as topicService from "@/services/topicService";

export const fetchTopics = createAsyncThunk("topics/fetchAll", async () => {
  const response = await topicService.getAll();
  return response.data;
});

export const fetchTopic = createAsyncThunk("topics/fetchOne", async (slug) => {
  const response = await topicService.getOne(slug);
  return response.data;
});

export const createTopic = createAsyncThunk("topics/create", async (data) => {
  const response = await topicService.create(data);
  return response.data;
});

export const updateTopic = createAsyncThunk(
  "topics/update",
  async ({ slug, data }) => {
    const response = await topicService.update(slug, data);
    return response.data;
  }
);

export const deleteTopic = createAsyncThunk("topics/delete", async (slug) => {
  await topicService.del(slug);
  return slug;
});

export const fetchTrendingTopics = createAsyncThunk(
  "topics/trending",
  async () => {
    const response = await topicService.getTrendingTopics();
    return response;
  }
);
