import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { showToast } from "../../utils/showToast";

// Get all trust items
export const getTrustItems = createAsyncThunk(
  "trust/getTrustItems",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/trust");
      return data.trustItems;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trust items."
      );
    }
  }
);

// Add trust item
export const addTrustItem = createAsyncThunk(
  "trust/addTrustItem",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/trust", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast({ message: data.message, type: data.success });
      return data.trust;
    } catch (error) {
      showToast({
        message: error.response?.data?.message || "Failed to add trust item.",
        type: false,
      });
      return rejectWithValue(
        error.response?.data?.message || "Failed to add trust item."
      );
    }
  }
);

// Update trust item
export const updateTrustItem = createAsyncThunk(
  "trust/updateTrustItem",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/trust/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast({ message: data.message, type: data.success });
      return data.trust;
    } catch (error) {
      showToast({
        message: error.response?.data?.message || "Failed to update trust item.",
        type: false,
      });
      return rejectWithValue(
        error.response?.data?.message || "Failed to update trust item."
      );
    }
  }
);

// Delete trust item
export const deleteTrustItem = createAsyncThunk(
  "trust/deleteTrustItem",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/trust/${id}`);
      showToast({ message: data.message, type: data.success });
      return id;
    } catch (error) {
      showToast({
        message: error.response?.data?.message || "Failed to delete trust item.",
        type: false,
      });
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete trust item."
      );
    }
  }
);

const trustSlice = createSlice({
  name: "trust",
  initialState: {
    trustItems: [],
    loading: false,
    actionLoading: false,
    error: null,
    editId: null,
  },
  reducers: {
    setTrustEditId: (state, action) => {
      state.editId = action.payload;
    },
    clearTrustEditId: (state) => {
      state.editId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getTrustItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrustItems.fulfilled, (state, action) => {
        state.loading = false;
        state.trustItems = action.payload;
      })
      .addCase(getTrustItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addTrustItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addTrustItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.trustItems.unshift(action.payload);
      })
      .addCase(addTrustItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateTrustItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTrustItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.editId = null;
        const index = state.trustItems.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) state.trustItems[index] = action.payload;
      })
      .addCase(updateTrustItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteTrustItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteTrustItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.trustItems = state.trustItems.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteTrustItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setTrustEditId, clearTrustEditId } = trustSlice.actions;
export default trustSlice.reducer;