import { createSlice } from "@reduxjs/toolkit";
import {
  deleteBookmarkUser,
  getBookmarkByUser,
  toggleBookmark,
} from "./bookmarkAsync";

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  message: null,
};

const bookmarkSlice = createSlice({
  name: "bookmarks",
  initialState,
  reducers: {
    clearBookmarkMessage: (state) => {
      state.message = null;
    },
    clearBookmarkError: (state) => {
      state.error = null;
    },
    setBookmarks: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleBookmark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        const { bookmarked, post_id, message } = action.payload;
        state.message = message;

        if (bookmarked) {
          if (!state.items.includes(post_id)) {
            state.items.push(post_id);
          }
        } else {
          state.items = state.items.filter((id) => id !== post_id);
        }
      })
      .addCase(toggleBookmark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getBookmarkByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookmarkByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.bookmarks || action.payload || [];
        state.message = action.payload.message;
      })
      .addCase(getBookmarkByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteBookmarkUser.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBookmarkUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [];
        state.message =
          action.payload.message || "Đã xóa tất cả bài viết đã lưu.";
      })
      .addCase(deleteBookmarkUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi khi xóa bài viết đã lưu.";
      });
  },
});

export const { clearBookmarkMessage, clearBookmarkError, setBookmarks } =
  bookmarkSlice.actions;

export default bookmarkSlice.reducer;
