import { createSlice } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import {
  getCurrentUser,
  postRegister,
  postLogOut,
  postLogIn,
  refreshToken,
  sendForgotPasswordEmail,
  verifyResetToken,
  resetPassword,
  verifyEmail,
} from "./authAsync";

const initialState = {
  currentUser: null,
  isLoading: false,
  isLoggedIn: false,
  error: null,
  message: null,
  _persist: null, // Thêm để theo dõi persist state
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.error = null;
      state.message = null;
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

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.currentUser = null;
        state.isLoggedIn = false;
        state.isLoading = false;
        state.error = action.error?.message || "Lỗi khi lấy thông tin user";
      })

      // Register
      .addCase(postRegister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(postRegister.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(postRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Lỗi khi đăng ký";
      })

      // Login
      .addCase(postLogIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(postLogIn.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(postLogIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Lỗi khi đăng nhập";
      })

      // Logout
      .addCase(postLogOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(postLogOut.fulfilled, (state) => {
        state.currentUser = null;
        state.isLoggedIn = false;
        state.isLoading = false;
        state.error = null;
        state.message = null;
      })
      .addCase(postLogOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Lỗi khi đăng xuất";
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        // Không set loading = true để tránh flickering
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.currentUser = null;
        state.isLoggedIn = false;
        state.error = action.error?.message || "Token hết hạn";
      })

      // Forgot password
      .addCase(sendForgotPasswordEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(sendForgotPasswordEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Email đã được gửi nếu tồn tại.";
      })
      .addCase(sendForgotPasswordEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Lỗi khi gửi email";
      })

      // Verify reset token
      .addCase(verifyResetToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyResetToken.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyResetToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Token không hợp lệ";
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Đặt lại mật khẩu thành công.";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Lỗi khi đặt lại mật khẩu";
      })

      // Verify email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || "Xác thực email thành công.";
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Lỗi khi xác thực email";
      });
  },
});

export const { logout, clearMessage, clearError, setRehydrated } =
  authSlice.actions;
export default authSlice.reducer;
