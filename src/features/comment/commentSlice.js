// commentSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchComments,
  fetchComment,
  createComment,
  updateComment,
  deleteComment,
} from "@/features/comment/commentAsync";

const initialState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
  message: null,
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearSelectedComment: (state) => {
      state.selected = null;
    },
    clearCommentMessage: (state) => {
      state.message = null;
    },
    clearCommentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchComment.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(createComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.isLoading = false;
        state.message = "Tạo bình luận thành công.";
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(updateComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.items = state.items.map((comment) =>
          comment.id === action.payload.id ? action.payload : comment
        );
        if (state.selected && state.selected.id === action.payload.id) {
          state.selected = action.payload;
        }
        state.isLoading = false;
        state.message = "Cập nhật bình luận thành công.";
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (comment) => comment.id !== action.payload
        );
        if (state.selected && state.selected.id === action.payload) {
          state.selected = null;
        }
        state.isLoading = false;
        state.message = "Xóa bình luận thành công.";
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearSelectedComment, clearCommentMessage, clearCommentError } =
  commentSlice.actions;
export default commentSlice.reducer;
