import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// =========================
// Thunks
// =========================

export const getCategories = createAsyncThunk(
  "category/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/categories/categories");
      return data.categories;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load categories"
      );
    }
  }
);

export const addCategory = createAsyncThunk(
  "category/addCategory",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        "/categories/addCategory",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data.category;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, data: formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/categories/updateCategory/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data.category;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/categories/deleteCategory", {
        data: { id },
      });

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

// =========================
// Slice
// =========================

const categorySlice = createSlice({
  name: "category",

  initialState: {
    categories: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // =========================
      // Get Categories
      // =========================
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // Add Category
      // =========================
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // Update Category
      // =========================
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.categories.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // Delete Category
      // =========================
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;

        state.categories = state.categories.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;