import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/settings");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load settings.");
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
      return rejectWithValue(err.response?.data?.message || "Failed to save settings.");
    }
  }
);

export const resetColorsRemote = createAsyncThunk(
  "settings/resetColors",
  async (mode, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/settings/reset-colors/${mode}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to reset colors.");
    }
  }
);

// payload: a FormData instance (may contain `video`, `image`, `isActive`)
export const saveHomeContent = createAsyncThunk(
  "settings/saveHomeContent",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/settings/home-content", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to save home content.");
    }
  }
);

// type: "video" | "image"
export const deleteHomeMedia = createAsyncThunk(
  "settings/deleteHomeMedia",
  async (type, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/settings/home-content/${type}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete media.");
    }
  }
);

// نفس ألوان الديفولت الموجودة في الباك اند (Settings model) — عشان أول تحميل يطلع متسق
const defaultColors = {
  light: {
    bg: "#f8f8f6", card: "#ffffff", text: "#0b0b0b", muted: "#6b6b6b",
    border: "#e5e5e5", primary: "#5a0000", primaryHover: "#760000",
    accent: "#8b1a1a", accentLight: "#f3e5e5",
  },
  dark: {
    bg: "#080808", card: "#111111", text: "#ffffff", muted: "#a0a0a0",
    border: "#252525", primary: "#8b1a1a", primaryHover: "#a52a2a",
    accent: "#b33a3a", accentLight: "#2a1111",
  },
};

const initialState = {
  theme: "light",
  colors: { light: { ...defaultColors.light }, dark: { ...defaultColors.dark } },
  company: { name: "Company", address: "" },
  social: { instagram: "", tiktok: "", facebook: "", whatsapp: "" },
  phone: "",
  homeContent: {
    video: { url: "", id: "" },
    image: { url: "", id: "" },
    isActive: false,
  },
  status: "idle",
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // معاينة لحظية فقط قبل الحفظ — مش بتحفظ في الداتابيز
    setColor(state, action) {
      const { mode, key, value } = action.payload;
      if (!state.colors[mode]) state.colors[mode] = {};
      state.colors[mode][key] = value;
    },
    setThemeLocal(state, action) {
      state.theme = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchSettings.fulfilled, (state, action) => { state.status = "succeeded"; Object.assign(state, action.payload); })
      .addCase(fetchSettings.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(saveSettings.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(saveSettings.fulfilled, (state, action) => { state.status = "succeeded"; Object.assign(state, action.payload); })
      .addCase(saveSettings.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(resetColorsRemote.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(resetColorsRemote.fulfilled, (state, action) => { state.status = "succeeded"; Object.assign(state, action.payload); })
      .addCase(resetColorsRemote.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(saveHomeContent.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(saveHomeContent.fulfilled, (state, action) => { state.status = "succeeded"; Object.assign(state, action.payload); })
      .addCase(saveHomeContent.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(deleteHomeMedia.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(deleteHomeMedia.fulfilled, (state, action) => { state.status = "succeeded"; Object.assign(state, action.payload); })
      .addCase(deleteHomeMedia.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; });
  },
});

export const { setColor, setThemeLocal } = settingsSlice.actions;
export default settingsSlice.reducer;