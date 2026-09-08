import axios from "axios";
import { store } from "../app/store";
import { setAccessToken, logout } from "../features/auth/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   REFRESH QUEUE
   عشان لو أكتر من request فشلوا في نفس اللحظة (401)،
   يعملوا refresh واحد بس مش واحد لكل request
========================================================= */

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers.forEach((callback) => callback(null));
  refreshSubscribers = [];
}

/*
 * Local-only logout: بيمسح الحالة في الـ redux + localStorage
 * من غير ما يبعت أي request للسيرفر (عشان منقعش في loop)
 */
function forceLocalLogout() {
  store.dispatch(logout());
  localStorage.removeItem("accessToken");

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // مفيش response خالص = مشكلة شبكة / CORS
    if (!error.response) {
      return Promise.reject(error);
    }

    const isTokenExpired =
      error.response.status === 401 &&
      error.response.data?.code === "TOKEN_EXPIRED";

    if (!isTokenExpired || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // لو فيه refresh شغال بالفعل، استنى نتيجته بدل ما تعمل واحد جديد
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // مهم: استخدم axios العادي مش axiosInstance عشان الـ refresh
      // نفسه ميدخلش في نفس الـ interceptor
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = response.data.accessToken;

      if (!newAccessToken) {
        throw new Error("Refresh response does not contain accessToken");
      }

      store.dispatch(setAccessToken(newAccessToken));
      localStorage.setItem("accessToken", newAccessToken);

      isRefreshing = false;
      onRefreshed(newAccessToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      console.error(
        "Refresh token failed:",
        refreshError.response?.data || refreshError.message
      );

      isRefreshing = false;
      onRefreshFailed();

      // لوج اويت محلي بس - من غير ما نبعت request تاني للسيرفر
      forceLocalLogout();

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;