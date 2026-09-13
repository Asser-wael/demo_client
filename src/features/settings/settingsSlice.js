import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/settings");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل تحميل الإعدادات"
      );
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
      return rejectWithValue(
        err.response?.data?.message || "فشل حفظ الإعدادات"
      );
    }
  }
);

const defaultColors = {
  light: {
    bg: "#f7f5f0",
    card: "#fffcf8",
    text: "#1a1a1a",
    muted: "#777777",
    border: "#e5e1d8",
    primary: "#b99a5a",
    primaryHover: "#a8894d",
    accent: "#c5a45d",
    accentLight: "#eee4cf",
  },

  dark: {
    bg: "#0a0a0a",
    card: "#111111",
    text: "#f5f5f5",
    muted: "#999999",
    border: "#292929",
    primary: "#c7a65c",
    primaryHover: "#d1af65",
    accent: "#d1af65",
    accentLight: "#2a2418",
  },
};

const initialState = {
  theme: "light",

  colors: {
    light: { ...defaultColors.light },
    dark: { ...defaultColors.dark },
  },

  company: {
    name: "company",
  },

  social: {
    instagram: "",
    tiktok: "",
    facebook: "",
    whatsapp: "",
  },

  phone: "",

  status: "idle",
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",

  initialState,

  reducers: {
    setColor(state, action) {
      const { mode, key, value } = action.payload;

      if (!state.colors[mode]) {
        state.colors[mode] = {};
      }

      state.colors[mode][key] = value;
    },

    resetColors(state, action) {
      const mode = action.payload;

      if (mode === "light" || mode === "dark") {
        state.colors[mode] = {
          ...defaultColors[mode],
        };
      }
    },

    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },

    setThemeLocal(state, action) {
      state.theme = action.payload;
    },

    setCompanyName(state, action) {
      state.company.name = action.payload;
    },

    setSocial(state, action) {
      const { key, value } = action.payload;

      if (key in state.social) {
        state.social[key] = value;
      }
    },

    setPhone(state, action) {
      state.phone = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded";

        Object.assign(state, action.payload);
      })

      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(saveSettings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(saveSettings.fulfilled, (state, action) => {
        state.status = "succeeded";

        Object.assign(state, action.payload);
      })

      .addCase(saveSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setColor,
  resetColors,
  toggleTheme,
  setThemeLocal,
  setCompanyName,
  setSocial,
  setPhone,
} = settingsSlice.actions;

export default settingsSlice.reducer;
