import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { showToast } from "../../utils/showToast";

// Get all products
export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/products/products");
      console.log(data.products);
      
      return data.products || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// Get latest products
export const getLatestProducts = createAsyncThunk(
  "product/getLatestProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/products/products/latest");
      return data.products || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch latest products"
      );
    }
  }
);

// Get product details
export const getProductDetails = createAsyncThunk(
  "product/getProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `/products/productDetails/${id}`
      );

      return {
        product: data.product,
        relatedProducts: data.relatedProducts || [],
        differentProducts: data.differentProducts || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch product details"
      );
    }
  }
);
// Add / Update review
export const addReview = createAsyncThunk(
  "product/addReview",
  async (
    { productId, rating, comment },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosInstance.post(
        `/products/product/${productId}/reviews`,
        {
          rating,
          comment,
        }
      );

      showToast({
        message: data.message,
        type: data.success,
      });

      return data.product;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to add review";

      showToast({
        message,
        type: false,
      });

      return rejectWithValue(message);
    }
  }
);
// Add product
export const addProduct = createAsyncThunk(
  "product/addProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        "/products/addProduct",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast({
        message: data.message,
        type: data.success,
      });

      return data.product;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to add product";

      showToast({
        message,
        type: false,
      });

      return rejectWithValue(message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ editid, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/products/updateProduct/${editid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast({
        message: data.message,
        type: data.success,
      });

      return data.product;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update product";

      showToast({
        message,
        type: false,
      });

      return rejectWithValue(message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(
        `/products/deleteProduct/${id}`
      );

      showToast({
        message: data.message,
        type: data.success,
      });

      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete product";

      showToast({
        message,
        type: false,
      });

      return rejectWithValue(message);
    }
  }
);

const initialState = {
  products: [],
  latestProducts: [],

  product: null,

  productDetails: {
    product: null,
    relatedProducts: [],
    differentProducts: [],
  },

  editid: null,

  loading: false,
  newLoading: false,
  detailsLoading: false,
  reviewLoading: false,
  actionLoading: false,

  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,

  reducers: {
    setEditid: (state, action) => {
      state.editid = action.payload;
    },

    clearEditid: (state) => {
      state.editid = null;
    },

    clearProduct: (state) => {
      state.product = null;
    },

    clearProductDetails: (state) => {
      state.productDetails = {
        product: null,
        relatedProducts: [],
        differentProducts: [],
      };
    },

    clearProductError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Get products
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })

      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Latest products
      .addCase(getLatestProducts.pending, (state) => {
        state.newLoading = true;
        state.error = null;
      })

      .addCase(getLatestProducts.fulfilled, (state, action) => {
        state.newLoading = false;
        state.latestProducts = action.payload;
      })

      .addCase(getLatestProducts.rejected, (state, action) => {
        state.newLoading = false;
        state.error = action.payload;
      })

      // Product details
      .addCase(getProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;

        state.productDetails = {
          product: null,
          relatedProducts: [],
          differentProducts: [],
        };
      })

      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.productDetails = action.payload;
      })

      .addCase(getProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Review
      .addCase(addReview.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })

      .addCase(addReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.productDetails.product = action.payload;
        state.product = action.payload;
      })

      .addCase(addReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload;
      })

      // Add product
      .addCase(addProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(addProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products.unshift(action.payload);
        state.latestProducts.unshift(action.payload);
      })

      .addCase(addProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.products = state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );

        state.latestProducts = state.latestProducts.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );

        state.product = action.payload;

        if (
          state.productDetails.product?._id === action.payload._id
        ) {
          state.productDetails.product = action.payload;
        }
      })

      .addCase(updateProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );

        state.latestProducts = state.latestProducts.filter(
          (product) => product._id !== action.payload
        );

        if (state.productDetails.product?._id === action.payload) {
          state.productDetails.product = null;
        }
      })

      .addCase(deleteProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setEditid,
  clearEditid,
  clearProduct,
  clearProductDetails,
  clearProductError,
} = productSlice.actions;

export default productSlice.reducer;