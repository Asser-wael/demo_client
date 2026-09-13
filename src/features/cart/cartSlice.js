import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { showToast } from "../../utils/showToast.jsx";

/* =========================================================
   GET CART
========================================================= */

export const getCart = createAsyncThunk(
    "cart/getCart",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/cart");

            return data.cart || data.items || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch cart"
            );
        }
    }
);

/* =========================================================
   ADD TO CART
========================================================= */

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (
        { productId, color, size, quantity = 1 },
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
                message: data.message || "Added to order",
            });

            return data.cart || data.items;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to add item to cart"
            );
        }
    }
);

/* =========================================================
   UPDATE CART ITEM
========================================================= */

export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async (
        { productId, color, size, quantity },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await axiosInstance.put(
                "/cart/update",
                {
                    productId,
                    color,
                    size,
                    quantity,
                }
            );

            return data.cart || data.items;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to update cart"
            );
        }
    }
);

/* =========================================================
   REMOVE FROM CART
========================================================= */

export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async (
        { productId, color, size },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await axiosInstance.delete(
                "/cart/remove",
                {
                    data: {
                        productId,
                        color,
                        size,
                    },
                }
            );

            showToast({
                type: "success",
                message: data.message || "Item removed",
            });

            return data.cart || data.items;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to remove item"
            );
        }
    }
);

/* =========================================================
   CLEAR CART
========================================================= */

export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.delete(
                "/cart/clear"
            );

            return data.cart || data.items || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to clear cart"
            );
        }
    }
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
    items: [],

    loading: false,

    actionLoading: false,

    error: null,

    /*
      Buy Now is local Redux state.
  
      It is NOT added to the normal cart.
      It is only used when the user clicks:
      Product Details -> Order Now -> Checkout
    */
    BuyNowitem: null,
};

/* =========================================================
   SLICE
========================================================= */

const cartSlice = createSlice({
    name: "cart",

    initialState,

    reducers: {
        /* =======================================================
           SET BUY NOW ITEM
        ======================================================= */

        setBuyNowItem: (state, action) => {
            state.BuyNowitem = null;
            state.BuyNowitem = action.payload;
        },

        /* =======================================================
           CLEAR BUY NOW ITEM
        ======================================================= */

        clearBuyNowItem: (state) => {
            state.BuyNowitem = null;
        },

        /* =======================================================
           CLEAR CART ERROR
        ======================================================= */

        clearCartError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            /* =====================================================
               GET CART
            ===================================================== */

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

            /* =====================================================
               ADD TO CART
            ===================================================== */

            .addCase(addToCart.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })

            .addCase(addToCart.fulfilled, (state, action) => {
                state.BuyNowitem = null;

                state.actionLoading = false;

                state.items = Array.isArray(action.payload)
                    ? action.payload
                    : state.items;
            })

            .addCase(addToCart.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            /* =====================================================
               UPDATE CART
            ===================================================== */

            .addCase(updateCartItem.pending, (state) => {
                state.BuyNowitem = null;

                state.actionLoading = true;
                state.error = null;
            })

            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.actionLoading = false;

                state.items = Array.isArray(action.payload)
                    ? action.payload
                    : state.items;
            })

            .addCase(updateCartItem.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            /* =====================================================
               REMOVE FROM CART
            ===================================================== */

            .addCase(removeFromCart.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })

            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.actionLoading = false;

                state.items = Array.isArray(action.payload)
                    ? action.payload
                    : state.items;
            })

            .addCase(removeFromCart.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            /* =====================================================
               CLEAR CART
            ===================================================== */

            .addCase(clearCart.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })

            .addCase(clearCart.fulfilled, (state, action) => {
                state.actionLoading = false;

                state.items = [];

                /*
                  Important:
                  We do NOT clear BuyNowitem here automatically.
        
                  Because clearCart() is also used after normal checkout,
                  and Buy Now is managed separately.
                */
            })

            .addCase(clearCart.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
    setBuyNowItem,
    clearBuyNowItem,
    clearCartError,
} = cartSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectCartItems = (state) =>
    state.cart.items;

export const selectCartLoading = (state) =>
    state.cart.loading;

export const selectCartActionLoading = (state) =>
    state.cart.actionLoading;

export const selectCartError = (state) =>
    state.cart.error;

/* =========================================================
   BUY NOW SELECTOR
========================================================= */

export const selectBuyNowItem = (state) =>
    state.cart.BuyNowitem;

/* =========================================================
   EXPORT
========================================================= */

export default cartSlice.reducer;