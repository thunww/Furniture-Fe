import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ userData, captchaToken }, thunkAPI) => {
    // ← SỬA: Nhận object với userData và captchaToken
    try {
      const response = await authService.login(userData, captchaToken); // ← Truyền captchaToken
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message:
          error.response?.data?.message || error.message || "Login failed",
        needCaptcha: error.response?.data?.needCaptcha || false, // ← THÊM
        isLocked: error.response?.data?.isLocked || false, // ← THÊM
        attempts: error.response?.data?.attempts || 0, // ← THÊM
      });
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
  return null;
});

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  roles: [],
  isAuthenticated: false,
  isLoading: false,
  message: null,
  error: null,
  needCaptcha: false, // ← THÊM
  isLocked: false, // ← THÊM
  attempts: 0, // ← THÊM
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    checkAuthStatus: (state) => {
      state.isAuthenticated = !!state.user;
    },
    resetMessage: (state) => {
      state.message = null;
      state.error = null;
      state.needCaptcha = false; // ← THÊM
      state.isLocked = false; // ← THÊM
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.roles = action.payload.user?.roles || [];
        state.isAuthenticated = false;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null; // ← THÊM: Clear error khi bắt đầu login
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.roles = action.payload.user.roles || [];
        state.isAuthenticated = true;
        state.message = action.payload.message;
        state.needCaptcha = false; // ← THÊM: Reset khi login thành công
        state.isLocked = false; // ← THÊM
        state.attempts = 0; // ← THÊM
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error?.message ||
          "Đăng nhập thất bại";
        state.needCaptcha = action.payload?.needCaptcha || false; // ← THÊM
        state.isLocked = action.payload?.isLocked || false; // ← THÊM
        state.attempts = action.payload?.attempts || 0; // ← THÊM
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.roles = action.payload.user?.roles || action.payload.roles || [];
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.message = null;
        state.error = null;
        state.needCaptcha = false; // ← THÊM
        state.isLocked = false; // ← THÊM
        state.attempts = 0; // ← THÊM
      });
  },
});

export const { checkAuthStatus, resetMessage } = authSlice.actions;
export default authSlice.reducer;
