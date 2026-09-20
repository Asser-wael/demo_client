import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { showToast } from "../../utils/showToast.jsx";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/auth/register`, data);
      showToast(res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      dispatch(setAccessToken(res.data.accessToken));
      localStorage.setItem("accessToken", res.data.accessToken);
      showToast(res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/resend-otp", data);
      showToast(res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/forgot-password", data);
      showToast(res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/reset-password", data);
      showToast(res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const googleAuth = createAsyncThunk(
  "auth/google",
  async (credential, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post("/auth/google", { credential });
      dispatch(setAccessToken(res.data.accessToken));
      localStorage.setItem("accessToken", res.data.accessToken);
      showToast(res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);
      dispatch(setAccessToken(res.data.accessToken));
      localStorage.setItem("accessToken", res.data.accessToken);
      showToast(res.data);
      return res.data;
    } catch (err) {
      // Login intentionally returns the whole error payload (not just the
      // message) here, since the "not verified" case needs `code` and
      // `email` to send the user straight to OTP verification.
      return rejectWithValue(err.response?.data || { message: "Error" });
    }
  }
);

export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/user");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const getNotifications = createAsyncThunk(
  "auth/getNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/user/getNotifications");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

/*
 * logoutUser: بيحاول يبلغ السيرفر (best effort) عشان يمسح
 * الـ Subscription والكوكي، لكن حتى لو السيرفر فشل، الحالة
 * المحلية (redux + localStorage) بتتمسح برضه في الـ .fulfilled/.rejected
 * عشان اليوزر ميفضلش عالق "لوج إن" في الواجهة.
 */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    userLoading: false,
    notifications: [],
    accessToken: localStorage.getItem("accessToken") || null,
    loading: false,
    loadingRegister: false,
    error: null,
    registerError: null,
  },

  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },

    // بتتنادى من axiosInstance لما الـ refresh يفشل نهائيًا (local-only logout)
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loadingRegister = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loadingRegister = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loadingRegister = false;
        state.registerError = action.payload;
      })

      // Verify OTP (registration)
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Google sign-in
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User
      .addCase(getUser.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.userLoading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.userLoading = false;
        state.error = action.payload;
      })

      // Logout - بيمسح الحالة المحلية سواء نجح السيرفر ولا لأ
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
      });
  },
});

export const { logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
