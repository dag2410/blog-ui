// postAsync.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as postService from "@/services/postService";

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ topic, page = 1, limit = 10 }) => {
    const response = await postService.getAll({ topic, page, limit });
    return response.data;
  }
);

export const fetchPost = createAsyncThunk("posts/fetchOne", async (slug) => {
  const response = await postService.getOne(slug);
  return response.data;
});

export const createPost = createAsyncThunk("posts/create", async (data) => {
  const response = await postService.create(data);
  return response.data;
});

export const updatePost = createAsyncThunk(
  "posts/update",
  async ({ slug, data }) => {
    const response = await postService.update(slug, data);
    console.log(response);
    return response.data;
  }
);

export const deletePost = createAsyncThunk("posts/delete", async (slug) => {
  await postService.del(slug);
  return slug;
});

export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async ({ userId, page = 1, limit = 10, search = "", status = "all" }) => {
    const response = await postService.getUserPosts(
      userId,
      page,
      limit,
      search,
      status
    );
    return response.data;
  }
);

export const fetchFeaturedPosts = createAsyncThunk(
  "posts/fetchFeatured",
  async () => {
    const response = await postService.getFeaturedPosts();
    return response.data;
  }
);

export const fetchRecentPosts = createAsyncThunk(
  "posts/fetchRecent",
  async () => {
    const response = await postService.getRecentPosts();
    return response.data;
  }
);

export const fetchRelatedPosts = createAsyncThunk(
  "posts/fetchRelated",
  async ({ topicId, excludeSlug }) => {
    const response = await postService.getRelatedPosts(topicId, excludeSlug);
    return response.data;
  }
);
