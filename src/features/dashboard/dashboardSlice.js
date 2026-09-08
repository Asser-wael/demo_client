import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"; // #عدّل المسار حسب مشروعك (axios instance فيه baseURL + withCredentials)

// #جلب الكروت (Revenue, Orders, Users, Products)
export const fetchDashboardCards = createAsyncThunk(
  "dashboard/fetchCards",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/admin/dashboard/cards");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

// #شارت الإيرادات - بياخد period: weekly | monthly | yearly
export const fetchRevenueChart = createAsyncThunk(
  "dashboard/fetchRevenueChart",
  async (period = "monthly", { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `/admin/dashboard/revenue-chart?period=${period}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

// #شارت الأوردرات - نفس فكرة الفترة
export const fetchOrdersChart = createAsyncThunk(
  "dashboard/fetchOrdersChart",
  async (period = "monthly", { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `/admin/dashboard/orders-chart?period=${period}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

// #آخر 5 أوردرات
export const fetchLatestOrders = createAsyncThunk(
  "dashboard/fetchLatestOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/admin/dashboard/latest-orders");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

// #المنتجات اللي مخزونها قرب يخلص
export const fetchLowStockProducts = createAsyncThunk(
  "dashboard/fetchLowStock",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/admin/dashboard/low-stock");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    cards: null,
    revenueChart: [],
    ordersChart: [],
    latestOrders: [],
    lowStock: [],

    // #فيلتر الفترة الحالي لكل شارت (منفصلين عشان ممكن اليوزر يغير واحد لوحده)
    revenuePeriod: "monthly",
    ordersPeriod: "monthly",

    loading: false,
    error: null,
  },
  reducers: {
    // #تغيير الفترة من الفرونت (زرار weekly/monthly/yearly)
    setRevenuePeriod: (state, action) => {
      state.revenuePeriod = action.payload;
    },
    setOrdersPeriod: (state, action) => {
      state.ordersPeriod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // #الكروت
      .addCase(fetchDashboardCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchDashboardCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // #شارت الإيرادات
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.revenueChart = action.payload;
      })

      // #شارت الأوردرات
      .addCase(fetchOrdersChart.fulfilled, (state, action) => {
        state.ordersChart = action.payload;
      })

      // #آخر الأوردرات
      .addCase(fetchLatestOrders.fulfilled, (state, action) => {
        state.latestOrders = action.payload;
      })

      // #المخزون القارب يخلص
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.lowStock = action.payload;
      });
  },
});

export const { setRevenuePeriod, setOrdersPeriod } = dashboardSlice.actions;
export default dashboardSlice.reducer;