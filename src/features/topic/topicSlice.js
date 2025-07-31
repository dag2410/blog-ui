import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTopic,
  fetchTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  fetchTrendingTopics,
} from "@/features/topic/topicAsync";

const initialState = {
  items: [],
  trendingTopics: [],
  selected: null,
  isLoading: false,
  isLoadingTrending: false,
  error: null,
  message: null,
};

const topicSlice = createSlice({
  name: "topics",
  initialState,
  reducers: {
    clearSelectedTopic: (state) => {
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
      .addCase(fetchTopics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchTopic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTopic.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchTopic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(createTopic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.isLoading = false;
        state.message = "Tạo chủ đề thành công.";
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(updateTopic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.items = state.items.map((topic) =>
          topic.slug === action.payload.slug ? action.payload : topic
        );
        if (state.selected && state.selected.slug === action.payload.slug) {
          state.selected = action.payload;
        }
        state.isLoading = false;
        state.message = "Cập nhật chủ đề thành công.";
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(deleteTopic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (topic) => topic.slug !== action.payload
        );
        if (state.selected && state.selected.slug === action.payload) {
          state.selected = null;
        }
        state.isLoading = false;
        state.message = "Xóa chủ đề thành công.";
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTrendingTopics.pending, (state) => {
        state.isLoadingTrending = true;
      })
      .addCase(fetchTrendingTopics.fulfilled, (state, action) => {
        state.trendingTopics = action.payload;
        state.isLoadingTrending = false;
      })
      .addCase(fetchTrendingTopics.rejected, (state, action) => {
        state.isLoadingTrending = false;
        state.error = action.error.message;
      });
  },
});

export const { clearSelectedTopic, clearMessage, clearError } =
  topicSlice.actions;
export default topicSlice.reducer;
