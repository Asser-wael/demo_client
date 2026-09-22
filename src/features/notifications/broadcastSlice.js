import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { showToast } from "../../utils/showToast.jsx";

// ============================================================
// SEND BROADCAST — immediately, or at a time resolved to each
// diner's own local timezone (server-side, from their IP)
// ============================================================

export const sendBroadcast = createAsyncThunk(
    "broadcast/send",
    async ({ title, message, mode, scheduledTime }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post("/notifications/broadcast", {
                title,
                message,
                mode,
                scheduledTime,
            });

            showToast({
                type: "success",
                message:
                    mode === "now"
                        ? "Broadcast sent to every diner."
                        : `Broadcast scheduled for ${scheduledTime} (each diner's local time).`,
            });

            return data.broadcast;
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to send broadcast";
            showToast({ type: "error", message });
            return rejectWithValue(message);
        }
    }
);

export const getBroadcasts = createAsyncThunk(
    "broadcast/getBroadcasts",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/notifications/broadcast");
            return data.broadcasts;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch broadcasts"
            );
        }
    }
);

const broadcastSlice = createSlice({
    name: "broadcast",
    initialState: {
        history: [],
        sending: false,
        loading: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(sendBroadcast.pending, (state) => {
                state.sending = true;
            })
            .addCase(sendBroadcast.fulfilled, (state, action) => {
                state.sending = false;
                state.history.unshift(action.payload);
            })
            .addCase(sendBroadcast.rejected, (state) => {
                state.sending = false;
            })

            .addCase(getBroadcasts.pending, (state) => {
                state.loading = true;
            })
            .addCase(getBroadcasts.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(getBroadcasts.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default broadcastSlice.reducer;
