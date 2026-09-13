import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../client/src/api/axiosInstance";

export const getSettings = createAsyncThunk(
  "settings/getSettings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/settings");

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load settings"
      );
    }
  }
);

export const saveSettings = createAsyncThunk(
  "settings/saveSettings",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/settings", payload);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save settings"
      );
    }
  }
);

export const resetColorsRemote = createAsyncThunk(
  "settings/resetColorsRemote",
  async (mode, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/settings/reset-colors/${mode}`
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset colors"
      );
    }
  }
);

const initialState = {
  theme: "light",

  colors: {
    light: {},
    dark: {},
  },

  company: {
    name: "",
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
    setColor: (state, action) => {
      const { mode, key, value } = action.payload;

      if (!state.colors[mode]) {
        state.colors[mode] = {};
      }

      state.colors[mode][key] = value;
    },

    setThemeLocal: (state, action) => {
      state.theme = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      // GET SETTINGS
      .addCase(getSettings.pending, (state) => {
        state.status = "loading";
      })

      .addCase(getSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;

        const settings = action.payload;

        state.theme = settings.theme || "light";

        state.colors = {
          light: settings.colors?.light || {},
          dark: settings.colors?.dark || {},
        };

        state.company = settings.company || {
          name: "",
        };

        state.social = settings.social || {
          instagram: "",
          tiktok: "",
          facebook: "",
          whatsapp: "",
        };

        state.phone = settings.phone || "";
      })

      .addCase(getSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // SAVE SETTINGS
      .addCase(saveSettings.pending, (state) => {
        state.status = "loading";
      })

      .addCase(saveSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;

        const settings = action.payload;

        state.theme = settings.theme || state.theme;

        state.colors = {
          light: settings.colors?.light || state.colors.light,
          dark: settings.colors?.dark || state.colors.dark,
        };

        state.company = settings.company || state.company;

        state.social = settings.social || state.social;

        state.phone =
          settings.phone !== undefined
            ? settings.phone
            : state.phone;
      })

      .addCase(saveSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // RESET COLORS
      .addCase(resetColorsRemote.pending, (state) => {
        state.status = "loading";
      })

      .addCase(resetColorsRemote.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;

        const settings = action.payload;

        state.colors = {
          light: settings.colors?.light || state.colors.light,
          dark: settings.colors?.dark || state.colors.dark,
        };
      })

      .addCase(resetColorsRemote.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setColor, setThemeLocal } = settingsSlice.actions;

export default settingsSlice.reducer;