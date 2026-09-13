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
      return data.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || "An error occurred while loading the cart.";
      return rejectWithValue(message);
    }
  }
);

// POST /cart/add
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, color, size, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/cart/add", {
        productId,
        color,
        size,
        quantity,
      });
      showToast({ type: "success", message: data.message });
      return data.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || "An error occurred while adding to cart.";
      showToast({ type: "error", message });
      return rejectWithValue(message);
    }
  }
);

// PUT /cart/update
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, color, size, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/cart/update", {
        productId,
        color,
        size,
        quantity,
      });
      return data.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || "An error occurred while updating the cart.";
      showToast({ type: "error", message });
      return rejectWithValue(message);
    }
  }
);

// DELETE /cart/remove
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, color, size }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete("/cart/remove", {
        data: { productId, color, size },
      });
      showToast({ type: "success", message: data.message });
      return data.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || "An error occurred while removing the item.";
      showToast({ type: "error", message });
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
      showToast({ type: "success", message: data.message });
      return data.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || "An error occurred while clearing the cart.";
      showToast({ type: "error", message });
      return rejectWithValue(message);
    }
  }
);

// ==========================================
// HELPERS
// ==========================================

const findItemIndex = (items, productId, color, size) =>
  items.findIndex(
    (item) =>
      (item.product?._id || item.product) === productId &&
      item.color === color &&
      item.size === size
  );

// ==========================================
// SLICE
// ==========================================

const initialState = {
  items: [],
  buyNowItem: null,
  loading: false, // getCart (initial full load)
  actionLoading: false, // add / update / remove / clear
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setBuyNowItem: (state, action) => {
      state.buyNowItem = action.payload;
      console.log(state.buyNowItem);
      
    },
    clearBuyNowItem: (state) => {
      state.buyNowItem = null;
    },
    // Optimistic local quantity bump, useful for instant UI feedback
    // before the updateCartItem thunk resolves
    setLocalQuantity: (state, action) => {
      const { productId, color, size, quantity } = action.payload;
      const index = findItemIndex(state.items, productId, color, size);
      if (index !== -1) state.items[index].quantity = quantity;
    },
    resetCartState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // GET CART
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD TO CART
      .addCase(addToCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // UPDATE CART ITEM
      .addCase(updateCartItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // REMOVE FROM CART
      .addCase(removeFromCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // CLEAR CART
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

export const selectCartItems = (state) => state.cart.items;
export const selectBuyNowItem = (state) => state.cart.buyNowItem;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartActionLoading = (state) => state.cart.actionLoading;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const price = item.product?.variants?.[0]?.price || 0;
    return sum + price * item.quantity;
  }, 0);

export const {
  setBuyNowItem,
  clearBuyNowItem,
  setLocalQuantity,
  resetCartState,
} = cartSlice.actions;

export default cartSlice.reducer;