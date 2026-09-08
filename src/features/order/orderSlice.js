import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { showToast } from "../../utils/showToast.jsx";

// ============================================================
// CHECKOUT
// ============================================================

export const checkoutOrder = createAsyncThunk(
    "order/checkoutOrder",
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post(
                "/orders/checkout",
                formData
            );

            showToast({
                type: "success",
                message: data.message,
            });

            return data.order;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to create order"
            );
        }
    }
);

// ============================================================
// GET ALL ORDERS - ADMIN
// ============================================================

export const getOrders = createAsyncThunk(
    "order/getOrders",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get(
                "/orders/orders"
            );

            return data.orders;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch orders"
            );
        }
    }
);

// ============================================================
// GET USER ORDERS
// ============================================================

export const getOrdersUser = createAsyncThunk(
    "order/getOrdersUser",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get(
                "/orders/my-orders"
            );

            return data.orders;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch orders"
            );
        }
    }
);

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getOrder = createAsyncThunk(
    "order/getOrder",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get(
                `/orders/orders/${id}`
            );

            return data.order;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch order"
            );
        }
    }
);

// ============================================================
// CHANGE STATUS
// ============================================================

export const changeOrderStatus = createAsyncThunk(
    "order/changeOrderStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.put(
                `/orders/changeStatus/${id}`,
                { status }
            );

            showToast(data);

            return data.order;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to update status"
            );
        }
    }
);

// ============================================================
// DELETE ORDER
// ============================================================

export const deleteOrder = createAsyncThunk(
    "order/deleteOrder",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.delete(
                `/orders/deleteOrder/${id}`
            );

            showToast(res.data);

            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to delete order"
            );
        }
    }
);

// ============================================================
// SLICE
// ============================================================

const orderSlice = createSlice({
    name: "order",

    initialState: {
        orders: [],
        myOrders: [],
        order: null,

        loading: false,
        actionLoading: false,
        checkoutLoading: false,

        error: null,
    },

    reducers: {
        // --------------------------------------------------------
        // Clear current order
        // --------------------------------------------------------

        clearOrder: (state) => {
            state.order = null;
        },

        // --------------------------------------------------------
        // Clear error
        // --------------------------------------------------------

        clearOrderError: (state) => {
            state.error = null;
        },

        // --------------------------------------------------------
        // ADD NEW ORDER FROM SOCKET
        // --------------------------------------------------------

        addOrder: (state, action) => {
            const newOrder = action.payload;

            // Prevent duplicate orders
            const exists = state.orders.some(
                (order) => order._id === newOrder._id
            );

            if (!exists) {
                state.orders.unshift(newOrder);
            }
        },
    },

    extraReducers: (builder) => {
        builder

            // ====================================================
            // CHECKOUT
            // ====================================================

            .addCase(checkoutOrder.pending, (state) => {
                state.checkoutLoading = true;
                state.error = null;
            })

            .addCase(checkoutOrder.fulfilled, (state, action) => {
                state.checkoutLoading = false;
                state.order = action.payload;
            })

            .addCase(checkoutOrder.rejected, (state, action) => {
                state.checkoutLoading = false;
                state.error = action.payload;
            })

            // ====================================================
            // GET ORDERS
            // ====================================================

            .addCase(getOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })

            .addCase(getOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ====================================================
            // GET USER ORDERS
            // ====================================================

            .addCase(getOrdersUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getOrdersUser.fulfilled, (state, action) => {
                state.loading = false;
                state.myOrders = action.payload;
            })

            .addCase(getOrdersUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ====================================================
            // GET SINGLE ORDER
            // ====================================================

            .addCase(getOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })

            .addCase(getOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ====================================================
            // CHANGE STATUS
            // ====================================================

            .addCase(changeOrderStatus.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })

            .addCase(changeOrderStatus.fulfilled, (state, action) => {
                state.actionLoading = false;

                state.orders = state.orders.map((order) =>
                    order._id === action.payload._id
                        ? action.payload
                        : order
                );

                if (
                    state.order?._id ===
                    action.payload._id
                ) {
                    state.order = action.payload;
                }
            })

            .addCase(changeOrderStatus.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // ====================================================
            // DELETE ORDER
            // ====================================================

            .addCase(deleteOrder.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })

            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.actionLoading = false;

                state.orders = state.orders.filter(
                    (order) =>
                        order._id !== action.payload
                );
            })

            .addCase(deleteOrder.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearOrder,
    clearOrderError,
    addOrder,
} = orderSlice.actions;

export default orderSlice.reducer;