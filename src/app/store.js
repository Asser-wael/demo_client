import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import productReducer from "../features/products/productSlice";
import categoryReducer from "../features/category/categorySlice";
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/order/orderSlice";

import notificationsAdminReducer from "../features/notifications/notificationsAdminSlice";
import userNotificationReducer from "../features/notifications/userNotificationSlice";

import dashboardReducer from "../features/dashboard/dashboardSlice";
import popularReducer from "../features/popular/popularSlice.js";
import trustReducer from "../features/trust/trustSlice.js";
import accountReducer from "../features/account/accountSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    
    products: productReducer,
    categories: categoryReducer,
    
    cart: cartReducer,
    orders: orderReducer,
    
    popular: popularReducer,
    trust: trustReducer,
    
    dashboard: dashboardReducer,
    
    // Admin notifications
    notificationsAdmin: notificationsAdminReducer,
    
    // User notifications
    userNotifications: userNotificationReducer,

    
    account: accountReducer,
  },
});