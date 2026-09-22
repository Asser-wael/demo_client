import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ============================================================
// GET ALL USERS - ADMIN
// ============================================================

export const getUsers = createAsyncThunk(
    "users/getUsers",
    async ({ page = 1, limit = 20, search = "" } = {}, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/users", {
                params: { page, limit, search },
            });

            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch users"
            );
        }
    }
);

const usersSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        pagination: null,
        search: "",
        loading: false,
        error: null,
    },
    reducers: {
        setUsersSearch(state, action) {
            state.search = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.pagination = action.payload.pagination;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setUsersSearch } = usersSlice.actions;
export default usersSlice.reducer;
