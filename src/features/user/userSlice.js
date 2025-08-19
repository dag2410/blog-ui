const { createSlice } = require("@reduxjs/toolkit");
const { fetchUser, updateUser } = require("./userAsync");

const initialState = {
  user: [],
  isLoading: false,
  error: null,
  message: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.pending, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUser.pending, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.pending, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.message = "Cập nhật thành công!";
      })
      .addCase(updateUser.pending, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearMessage } = userSlice.actions;

export default userSlice.reducer;
