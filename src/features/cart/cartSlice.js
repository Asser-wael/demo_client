import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { showToast } from "../../utils/showToast";

// ==========================================
// THUNKS
// ==========================================

// GET /cart
export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/cart");

      return data.cart || [];
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An error occurred while loading the cart.";

      return rejectWithValue(message);
    }
  }
);

// POST /cart/add
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { productId, color, size, quantity },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosInstance.post("/cart/add", {
        productId,
        color,
        size,
        quantity,
      });

      showToast({
        type: "success",
        message: data.message || "Item added to cart.",
      });

      return data.cart || [];
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An error occurred while adding to cart.";

      showToast({
        type: "error",
        message,
      });

      return rejectWithValue(message);
    }
  }
);

// PUT /cart/update
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { productId, color, size, quantity },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosInstance.put("/cart/update", {
        productId,
        color,
        size,
        quantity,
      });

      return data.cart || [];
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An error occurred while updating the cart.";

      showToast({
        type: "error",
        message,
      });

      return rejectWithValue(message);
    }
  }
);

// DELETE /cart/remove
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (
    { productId, color, size },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosInstance.delete("/cart/remove", {
        data: {
          productId,
          color,
          size,
        },
      });

      showToast({
        type: "success",
        message: data.message || "Item removed from cart.",
      });

      return data.cart || [];
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An error occurred while removing the item.";

      showToast({
        type: "error",
        message,
      });

      return rejectWithValue(message);
    }
  }
);

// DELETE /cart/clear
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete("/cart/clear");

      showToast({
        type: "success",
        message: data.message || "Cart cleared.",
      });

      return data.cart || [];
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An error occurred while clearing the cart.";

      showToast({
        type: "error",
        message,
      });

      return rejectWithValue(message);
    }
  }
);

// ==========================================
// HELPERS
// ==========================================

const findItemIndex = (
  items,
  productId,
  color,
  size
) =>
  items.findIndex(
    (item) =>
      (item.product?._id || item.product) === productId &&
      item.color === color &&
      item.size === size
  );

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  items: [],

  // IMPORTANT:
  // Always use buyNowItem with lowercase b
  buyNowItem: null,

  loading: false,
  actionLoading: false,
  error: null,
};

// ==========================================
// SLICE
// ==========================================

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    // ======================================
    // BUY NOW
    // ======================================

    setBuyNowItem: (state, action) => {
      state.buyNowItem = action.payload;
    },

    clearBuyNowItem: (state) => {
      state.buyNowItem = null;
    },

    // ======================================
    // LOCAL QUANTITY
    // ======================================

    setLocalQuantity: (state, action) => {
      const {
        productId,
        color,
        size,
        quantity,
      } = action.payload;

      const index = findItemIndex(
        state.items,
        productId,
        color,
        size
      );

      if (index !== -1) {
        state.items[index].quantity = quantity;
      }
    },

    // ======================================
    // RESET
    // ======================================

    resetCartState: () => ({
      ...initialState,
    }),
  },

  extraReducers: (builder) => {
    builder

      // ======================================
      // GET CART
      // ======================================

      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================================
      // ADD TO CART
      // ======================================

      .addCase(addToCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.items = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(addToCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // ======================================
      // UPDATE CART
      // ======================================

      .addCase(updateCartItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.items = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(updateCartItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // ======================================
      // REMOVE
      // ======================================

      .addCase(removeFromCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.items = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(removeFromCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // ======================================
      // CLEAR
      // ======================================

      .addCase(clearCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(clearCart.fulfilled, (state) => {
        state.actionLoading = false;
        state.items = [];
      })

      .addCase(clearCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

// ==========================================
// SELECTORS
// ==========================================

export const selectCartItems = (state) =>
  state.cart.items;

export const selectBuyNowItem = (state) =>
  state.cart.buyNowItem;

export const selectCartLoading = (state) =>
  state.cart.loading;

export const selectCartActionLoading = (state) =>
  state.cart.actionLoading;

export const selectCartCount = (state) =>
  state.cart.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const variant = item.product?.variants?.find(
      (v) => v?.color?.name === item.color
    );

    const size = variant?.sizes?.find(
      (s) => s?.size === item.size
    );

    const price = Number(
      size?.offerPrice > 0
        ? size.offerPrice
        : size?.price || 0
    );

    return (
      sum +
      price * Number(item.quantity || 0)
    );
  }, 0);

// ==========================================
// ACTIONS
// ==========================================

export const {
  setBuyNowItem,
  clearBuyNowItem,
  setLocalQuantity,
  resetCartState,
} = cartSlice.actions;

// ==========================================
// REDUCER
// ==========================================

export default cartSlice.reducer;