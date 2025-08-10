import { createSlice } from "@reduxjs/toolkit";
import {
  toggleFollow,
  fetchFollowing,
  fetchFollowers,
} from "@/features/follow/followAsync";

const initialState = {
  following: [],
  followers: [],
  isLoading: false,
  error: null,
  message: null,
};

const followSlice = createSlice({
  name: "follows",
  initialState,
  reducers: {
    clearFollowMessage: (state) => {
      state.message = null;
    },
    clearFollowError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleFollow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.followed) {
          state.following.push(action.payload);
        } else {
          state.following = state.following.filter(
            (f) => f.id !== action.payload.followed_id
          );
        }
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // fetchFollowing
      .addCase(fetchFollowing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // fetchFollowers
      .addCase(fetchFollowers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearFollowMessage, clearFollowError } = followSlice.actions;
export default followSlice.reducer;
