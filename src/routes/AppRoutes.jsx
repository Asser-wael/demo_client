import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Routes
import GuestRoute from "./GuestRoute";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

// Layouts & Components
import Error from "../components/common/Error";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

// Pages
import Sale from "../pages/Sale.jsx";
import AppError from "../components/common/AppError.jsx";

// =========================
// Public Pages
// =========================
const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetails = lazy(() => import("../pages/ProductDetails.jsx"));
const Collections = lazy(() => import("../pages/Collections"));
const CategoryDetails = lazy(() => import("../pages/CategoryDetails.jsx"));
const Cart = lazy(() => import("../pages/Cart"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const VerifyOtp = lazy(() => import("../pages/VerifyOtp"));
const Notifications = lazy(() => import("../pages/Notifications.jsx"));

// =========================
// Private User Pages
// =========================
const Checkout = lazy(() => import("../pages/Checkout"));
const Orders = lazy(() => import("../pages/Orders"));
const Account = lazy(() => import("../pages/Account"));

// =========================
// Admin Pages
// =========================
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ProductsAdmin = lazy(() => import("../pages/admin/Products"));
const AddProduct = lazy(() =>
  import("../components/products/AddProduct")
);
const AdminProductDetails = lazy(() =>
  import("../components/products/AdminProductDetails.jsx")
);
const Categories = lazy(() => import("../pages/admin/Categories"));
const Users = lazy(() => import("../pages/admin/Users"));
const OrdersAdmin = lazy(() => import("../pages/admin/OrdersAdmin"));
const AdminNotifications = lazy(() =>
  import("../pages/admin/Notifications")
);
const Popular = lazy(() => import("../pages/admin/Popular"));
const Trust = lazy(() => import("../pages/admin/Trust"));

// =========================
// Loading
// =========================
const Loader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
  </div>
);

const Loadable = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

// =========================
// Router
// =========================
export const router = createBrowserRouter([
  // =========================
  // Guest
  // =========================
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: Loadable(Login),
      },
      {
        path: "/register",
        element: Loadable(Register),
      },
    ],
  },

  // =========================
  // User
  // =========================
  {
    path: "/",
    element: <UserLayout />,
    errorElement: <AppError />,

    children: [
      {
        index: true,
        element: Loadable(Home),
      },

      {
        path: "products",
        element: Loadable(Products),
      },

      {
        path: "products/:id",
        element: Loadable(ProductDetails),
      },



      {
        path: "sale",
        element: <Sale />,
      },

      {
        path: "collections",
        element: Loadable(Collections),
      },

      {
        path: "collections/:id",
        element: Loadable(CategoryDetails),
      },

      {
        path: "verify-otp",
        element: Loadable(VerifyOtp),
      },


      // Notifications


      // =========================
      // Protected User Routes
      // =========================
      {
        element: <PrivateRoute />,
        errorElement: <AppError />,
        children: [
          {
            path: "cart",
            element: Loadable(Cart),
          },
          {
            path: "notifications",
            element: Loadable(Notifications),
          },
          {
            path: "checkout",
            element: Loadable(Checkout),
          },

          {
            path: "orders",
            element: Loadable(Orders),
          },
          {
            path: "profile",
            element: Loadable(Account),
          },
        ],
      },
    ],
  },

  // =========================
  // Admin
  // =========================
  {
    path: "/admin",
    element: <AdminRoute />,
    errorElement: <AppError />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: Loadable(Dashboard),
          },

          {
            path: "products",
            element: Loadable(ProductsAdmin),
          },

          {
            path: "products/add",
            element: Loadable(AddProduct),
          },

          {
            path: "products/:id",
            element: Loadable(AdminProductDetails),
          },

          {
            path: "categories",
            element: Loadable(Categories),
          },

          {
            path: "users",
            element: Loadable(Users),
          },

          {
            path: "orders",
            element: Loadable(OrdersAdmin),
          },

          {
            path: "notificationsAdmin",
            element: Loadable(AdminNotifications),
          },

          {
            path: "popular",
            element: Loadable(Popular),
          },

          {
            path: "trust",
            element: Loadable(Trust),
          },
        ],
      },
    ],
  },

  // =========================
  // 404
  // =========================
  {
    path: "*",
    element: <Error />,
  },
]);