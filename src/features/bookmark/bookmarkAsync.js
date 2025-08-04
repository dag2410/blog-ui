import { createAsyncThunk } from "@reduxjs/toolkit";
import bookmarkService from "@/services/bookmarkService";

export const toggleBookmark = createAsyncThunk(
  "bookmarks/toggleBookmark",
  async ({ user_id, post_id }) => {
    const response = await bookmarkService.toggleBookmark({
      user_id,
      post_id,
    });
    return response.data;
  }
);

export const getBookmarkByUser = createAsyncThunk(
  "bookmarks/getBookmarkByUser",
  async ({ user_id }) => {
    const response = await bookmarkService.getBookmarkByUser({
      user_id,
    });
    return response.data;
  }
);

export const deleteBookmarkUser = createAsyncThunk(
  "bookmarks/deleteBookmarkByUser",
  async ({ user_id }) => {
    const response = await bookmarkService.deleteBookmarkUser({
      user_id,
    });
    return response.data;
  }
);
