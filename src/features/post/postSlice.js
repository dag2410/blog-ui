import {
  createPost,
  deletePost,
  fetchFeaturedPosts,
  fetchPost,
  fetchPosts,
  fetchRecentPosts,
  fetchRelatedPosts,
  fetchUserPosts,
  updatePost,
} from "@/features/post/postAsync";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  featuredPosts: [],
  recentPosts: [],
  relatedPosts: [],
  selected: null,
  isLoading: false,
  error: null,
  message: null,
  loadingFeaturedPosts: false,
  loadingRelatedPosts: false,
  LoadingRecentPosts: false,
  errorFeatured: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearSelectedPost: (state) => {
      state.selected = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        if (!Array.isArray(state.items)) {
          state.items = [];
        }
        state.items.push(action.payload);
        state.isLoading = false;
        state.message = "Tạo bài viết thành công.";
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.items = Array.isArray(state.items)
          ? state.items.map((post) =>
              post.slug === action.payload.slug ? action.payload : post
            )
          : [action.payload];
        if (state.selected && state.selected.slug === action.payload.slug) {
          state.selected = action.payload;
        }
        state.isLoading = false;
        state.message = "Cập nhật bài viết thành công.";
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (post) => post.slug !== action.payload
        );
        if (state.selected && state.selected.slug === action.payload) {
          state.selected = null;
        }
        state.isLoading = false;
        state.message = "Xóa bài viết thành công.";
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.items = action.payload.items || action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchFeaturedPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFeaturedPosts.fulfilled, (state, action) => {
        state.featuredPosts = action.payload;
      })
      .addCase(fetchFeaturedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchRecentPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecentPosts.fulfilled, (state, action) => {
        state.recentPosts = action.payload;
      })
      .addCase(fetchRecentPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchRelatedPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRelatedPosts.fulfilled, (state, action) => {
        state.relatedPosts = action.payload;
      })
      .addCase(fetchRelatedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearSelectedPost, clearMessage, clearError } =
  postSlice.actions;
export default postSlice.reducer;
