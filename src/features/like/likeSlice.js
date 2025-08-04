import { createSlice } from "@reduxjs/toolkit";
import { toggleLike } from "@/features/like/likeAsync";

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  message: null,
};

const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    clearLikeMessage: (state) => {
      state.message = null;
    },
    clearLikeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleLike.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const {
          likeable_type,
          likeable_id,
          action: toggleAction,
        } = action.payload;

        if (toggleAction === "liked") {
          state.items.push({ likeable_type, likeable_id });
          state.message = "Đã like.";
        } else if (toggleAction === "unliked") {
          state.items = state.items.filter(
            (item) =>
              !(
                item.likeable_type === likeable_type &&
                item.likeable_id === likeable_id
              )
          );
          state.message = "Đã bỏ like.";
        }

        state.isLoading = false;
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearLikeMessage, clearLikeError } = likeSlice.actions;
export default likeSlice.reducer;
