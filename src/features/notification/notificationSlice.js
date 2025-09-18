import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createNotifications,
  deleteNotifications,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notificationAsync";

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  message: null,
};

// Slice
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(createNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNotifications.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.isLoading = false;
        state.message = "Notification created successfully";
      })
      .addCase(createNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(deleteNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteNotifications.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (notification) => notification.id !== action.payload.id
        );
        state.isLoading = false;
        state.message = "Notification deleted successfully";
      })
      .addCase(deleteNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
        state.message = "Notification marked as read";
      })

      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({
          ...n,
          isRead: true,
        }));
        state.message = "All notifications marked as read";
      });
  },
});

export const { clearMessage, clearError, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
