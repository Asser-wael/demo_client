import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"; 

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/settings");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل تحميل الإعدادات");
    }
  }
);

export const saveSettings = createAsyncThunk(
  "settings/save",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/settings", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل حفظ الإعدادات");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    theme: "light",
    colors: { light: {}, dark: {} },
    company: { name: "company" },
    social: { instagram: "", tiktok: "", facebook: "", whatsapp: "" },
    phone: "",
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    setThemeLocal(state, action) {
      state.theme = action.payload; // تحديث فوري في الـ UI قبل ما السيرفر يرد
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        Object.assign(state, action.payload);
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export const { setThemeLocal } = settingsSlice.actions;
export default settingsSlice.reducer;