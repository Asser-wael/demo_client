import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ==========================================
// GET ADMIN NOTIFICATIONS
// ==========================================
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        "/notifications"
      );

      return data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch notifications"
      );
    }
  }
);

// ==========================================
// MARK ONE AS READ
// ==========================================
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/notifications/${id}/read`
      );

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update notification"
      );
    }
  }
);

// ==========================================
// MARK ALL AS READ
// ==========================================
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.put(
        "/notifications/read-all"
      );

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update notifications"
      );
    }
  }
);

// ==========================================
// DELETE
// ==========================================
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `/notifications/${id}`
      );

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete notification"
      );
    }
  }
);

// ==========================================
// SLICE
// ==========================================
const notificationsAdminSlice = createSlice({
  name: "notifications",

  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
    },

    clearNotifications: (state) => {
      state.items = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // GET
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // MARK ONE
      .addCase(
        markNotificationAsRead.fulfilled,
        (state, action) => {
          const notification = state.items.find(
            (item) => item._id === action.payload._id
          );

          if (notification) {
            notification.read = true;
          }
        }
      )

      // MARK ALL
      .addCase(
        markAllNotificationsAsRead.fulfilled,
        (state) => {
          state.items.forEach((item) => {
            item.read = true;
          });
        }
      )

      // DELETE
      .addCase(
        deleteNotification.fulfilled,
        (state, action) => {
          state.items = state.items.filter(
            (item) => item._id !== action.payload
          );
        }
      );
  },
});

export const {
  addNotification,
  clearNotifications,
} = notificationsAdminSlice.actions;

export default notificationsAdminSlice.reducer;