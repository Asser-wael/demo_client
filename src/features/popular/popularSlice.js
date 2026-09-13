import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { showToast } from "../../utils/showToast";

// =====================================================
// GET POPULAR PRODUCTS
// =====================================================

export const getPopularProducts = createAsyncThunk(
    "popular/getPopularProducts",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/popular");

            return data.products || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch popular products."
            );
        }
    }
);

// =====================================================
// ADD POPULAR PRODUCT
// =====================================================

export const addPopularProduct = createAsyncThunk(
    "popular/addPopularProduct",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post("/popular", {
                id,
            });

            showToast({
                message: data.message,
                type: data.success,
            });

            return data.popular;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to add popular product."
            );
        }
    }
);

// =====================================================
// DELETE POPULAR PRODUCT
// =====================================================

export const deletePopularProduct = createAsyncThunk(
    "popular/deletePopularProduct",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.delete(
                `/popular/${id}`
            );

            showToast({
                message: data.message,
                type: data.success,
            });

            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to delete popular product."
            );
        }
    }
);

// =====================================================
// SLICE
// =====================================================

const popularSlice = createSlice({
    name: "popular",

    initialState: {
        products: [],
        loading: false,
        actionLoading: false,
        error: null,
    },

    reducers: {
        clearPopularError: (state) => {
            state.error = null;
        },

        clearPopularProducts: (state) => {
            state.products = [];
        },
    },

    extraReducers: (builder) => {
        builder

            // =================================================
            // GET
            // =================================================

            .addCase(
                getPopularProducts.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                getPopularProducts.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.products = action.payload || [];
                }
            )

            .addCase(
                getPopularProducts.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            // =================================================
            // ADD
            // =================================================

            .addCase(
                addPopularProduct.pending,
                (state) => {
                    state.actionLoading = true;
                    state.error = null;
                }
            )

            .addCase(
                addPopularProduct.fulfilled,
                (state, action) => {
                    state.actionLoading = false;


                    if (action.payload) {
                        const exists = state.products.some(
                            (item) => {
                                const productId =
                                    item?.id?._id ||
                                    item?._id ||
                                    item?.id;

                                const newId =
                                    action.payload?.id?._id ||
                                    action.payload?._id ||
                                    action.payload?.id;

                                return productId === newId;
                            }
                        );

                        if (!exists) {
                            state.products.push(
                                action.payload
                            );
                        }
                    }
                }
            )

            .addCase(
                addPopularProduct.rejected,
                (state, action) => {
                    state.actionLoading = false;
                    state.error = action.payload;
                }
            )

            // =================================================
            // DELETE
            // =================================================

            .addCase(
                deletePopularProduct.pending,
                (state) => {
                    state.actionLoading = true;
                    state.error = null;
                }
            )

            .addCase(
                deletePopularProduct.fulfilled,
                (state, action) => {
                    state.actionLoading = false;

                    state.products =
                        state.products.filter((item) => {
                            const productId =
                                item?.id?._id ||
                                item?._id ||
                                item?.id;

                            return productId !== action.payload;
                        });
                }
            )

            .addCase(
                deletePopularProduct.rejected,
                (state, action) => {
                    state.actionLoading = false;
                    state.error = action.payload;
                }
            );
    },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
    clearPopularError,
    clearPopularProducts,
} = popularSlice.actions;


// =====================================================
// REDUCER
// =====================================================

export default popularSlice.reducer;