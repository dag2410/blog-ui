// src/features/message/messageSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unreadMap: {},
  totalUnread: 0,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    incrementUnread: (state, action) => {
      const convId = action.payload;
      state.unreadMap[convId] = (state.unreadMap[convId] || 0) + 1;
      state.totalUnread++;
    },
    resetUnread: (state, action) => {
      const convId = action.payload;
      if (state.unreadMap[convId]) {
        state.totalUnread -= state.unreadMap[convId];
        delete state.unreadMap[convId];
      }
    },
    resetAllUnread: (state) => {
      state.unreadMap = {};
      state.totalUnread = 0;
    },
  },
});

export const { incrementUnread, resetUnread, resetAllUnread } =
  messageSlice.actions;

export default messageSlice.reducer;
