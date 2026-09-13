import { Suspense, useCallback, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { router } from "./routes/AppRoutes.jsx";
import Loading from "./components/common/Loading.jsx";

import { subscribeToPush } from "./utils/pushSubscribe.js";
import { printOrder } from "./utils/printOrder.js";

import useSocket from "./hooks/useSocket.js";

import { playSound, sounds } from "./utils/playSound.js";
import { showToast } from "./utils/showToast.jsx";

import { getUser } from "./features/auth/authSlice.js";
import { getCart } from "./features/cart/cartSlice.js";
import {
  addOrder,
  getOrdersUser,
} from "./features/order/orderSlice.js";

function App() {
  const dispatch = useDispatch();
  const socket = useSocket();

  const { user, accessToken } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.orders);

  // =========================================================
  // AUTH
  // =========================================================

  useEffect(() => {
    if (!accessToken) return;

    dispatch(getUser());
  }, [accessToken, dispatch]);

  // =========================================================
  // LOAD USER ORDERS
  // =========================================================

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") return;

    dispatch(getOrdersUser());
  }, [user, dispatch]);

  // =========================================================
  // USER ORDER ROOMS
  // =========================================================

  useEffect(() => {
    if (!socket) return;
    if (!user) return;
    if (user.role === "admin") return;
    if (!orders?.length) return;

    const joinOrderRooms = () => {
      orders.forEach((order) => {
        if (!order?._id) return;

        socket.emit("userOrder", order._id);
      });
    };

    if (socket.connected) {
      joinOrderRooms();
    }

    socket.on("connect", joinOrderRooms);

    return () => {
      socket.off("connect", joinOrderRooms);
    };
  }, [socket, user, orders]);

  // =========================================================
  // ADMIN: NEW ORDER
  // =========================================================

  const handleNewOrder = useCallback(
    async (order) => {
      if (!order?._id) return;

      // This event should only be handled by admin
      if (user?.role !== "admin") return;

      playSound?.(sounds.newOrder);

      showToast({
        type: "adminOrder",
        message: `${order.items?.length || 0} items received`,
        amount: order.totalPrice,
      });

      dispatch(addOrder(order));

      try {
        await printOrder(order);

        showToast({
          type: "success",
          message: "Order printed successfully",
        });
      } catch (error) {
        console.error("Print order error:", error);

        showToast({
          type: "error",
          message: "Order received, but printing failed",
        });
      }
    },
    [dispatch, user?.role]
  );

  // =========================================================
  // LOW STOCK
  // =========================================================

  const handleWarning = useCallback(
    (data) => {
      if (!data) return;

      if (user?.role !== "admin") return;

      playSound?.(sounds.lowStock);

      showToast({
        type: "lowStock",
        message: `${data.name} is running low on stock (${data.color} - ${data.size})`,
      });
    },
    [user?.role]
  );

  // =========================================================
  // ORDER STATUS
  // =========================================================

  const handleOrderStatus = useCallback(
    (data) => {
      if (!data) return;

      // Only normal users should receive customer order updates
      if (user?.role === "admin") return;

      playSound?.(sounds.orderStatus);

      showToast({
        type: "orderStatus",
        message:
          data.body ||
          `Order status updated to ${data.status}`,
      });
    },
    [user?.role]
  );

  // =========================================================
  // SOCKET EVENTS
  // =========================================================

  useEffect(() => {
    if (!socket) return;

    socket.on("newOrder", handleNewOrder);
    socket.on("warning", handleWarning);
    socket.on("orderStatus", handleOrderStatus);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("warning", handleWarning);
      socket.off("orderStatus", handleOrderStatus);
    };
  }, [
    socket,
    handleNewOrder,
    handleWarning,
    handleOrderStatus,
  ]);

  // =========================================================
  // CART
  // =========================================================

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // =========================================================
  // PUSH NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    if (!user) return;

    subscribeToPush();
  }, [user]);

  // =========================================================
  // ADMIN ROOM
  // =========================================================

  useEffect(() => {
    if (!socket) return;
    if (user?.role !== "admin") return;

    const joinAdminRoom = () => {
      socket.emit("admin");
    };

    if (socket.connected) {
      joinAdminRoom();
    }

    socket.on("connect", joinAdminRoom);

    return () => {
      socket.off("connect", joinAdminRoom);
    };
  }, [socket, user?.role]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 24,
          right: 24,
        }}
        toastOptions={{
          duration: 4000,
        }}
      />

      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

export default App;