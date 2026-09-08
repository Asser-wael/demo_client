import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ==========================================
// GET USER NOTIFICATIONS
// ==========================================
export const fetchUserNotifications = createAsyncThunk(
  "userNotifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/notifications/user");

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
export const markUserNotificationAsRead = createAsyncThunk(
  "userNotifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/notifications/user/${id}/read`
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
export const markAllUserNotificationsAsRead = createAsyncThunk(
  "userNotifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.put(
        "/notifications/user/read-all"
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
// DELETE ONE
// ==========================================
export const deleteUserNotification = createAsyncThunk(
  "userNotifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `/notifications/user/${id}`
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
const userNotificationSlice = createSlice({
  name: "userNotifications",

  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {
    addUserNotification: (state, action) => {
      state.items.unshift(action.payload);
    },

    clearUserNotifications: (state) => {
      state.items = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // GET
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // MARK ONE
      .addCase( markUserNotificationAsRead.fulfilled, (state, action) => {
          const notification = state.items.find(
            (item) => item._id === action.payload._id
          );

          if (notification) {
            notification.isRead = true;
          }
        }
      )

      // MARK ALL
      .addCase(
        markAllUserNotificationsAsRead.fulfilled,
        (state) => {
          state.items.forEach((item) => {
            item.isRead = true;
          });
        }
      )

      // DELETE
      .addCase(
        deleteUserNotification.fulfilled,
        (state, action) => {
          state.items = state.items.filter(
            (item) => item._id !== action.payload
          );
        }
      );
  },
});

export const {
  addUserNotification,
  clearUserNotifications,
} = userNotificationSlice.actions;

export default userNotificationSlice.reducer;