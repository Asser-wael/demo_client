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
import { addOrder, getOrdersUser } from "./features/order/orderSlice.js";

function App() {
  const dispatch = useDispatch();
  const socket = useSocket();

  const { user, accessToken } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.orders);

  /* =========================================================
     AUTH & USER ORDERS
  ========================================================= */

  useEffect(() => {
    if (!accessToken) return;
    dispatch(getUser());
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      dispatch(getOrdersUser());
    }
  }, [dispatch, user]);

  /* =========================================================
     USER ORDER ROOMS (with reconnect handling)
  ========================================================= */

  useEffect(() => {
    if (!socket || !user || user.role === "admin" || !orders?.length) return;

    const joinRooms = () => {
      orders.forEach(({ _id }) => {
        if (_id) socket.emit("userOrder", _id);
      });
    };

    // Join now if already connected
    if (socket.connected) joinRooms();

    // Re-join on every (re)connect — this fixes the case where the socket
    // reconnects after network drop / server restart and room membership
    // is lost on the server side.
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
    };
  }, [socket, user, orders]);

  /* =========================================================
     SOCKET HANDLERS
  ========================================================= */

  const handleNewOrder = useCallback(
    async (order) => {
      if (!order?._id) return;

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
        showToast({
          type: "error",
          message: "Order received, but printing failed",
        });
      }
    },
    [dispatch]
  );

  const handleWarning = useCallback((data) => {
    if (!data) return;
    playSound?.(sounds.lowStock);
    showToast({
      type: "lowStock",
      message: `${data.name} is running low on stock (${data.color} - ${data.size})`,
    });
  }, []);

  const handleOrderStatus = useCallback((data) => {
    if (!data) return;
    playSound?.(sounds.orderStatus);
    showToast({
      type: "orderStatus",
      message: data.body || `Order status updated to ${data.status}`,
    });
  }, []);

  /* =========================================================
     LISTEN TO SOCKET EVENTS
  ========================================================= */

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
  }, [socket, handleNewOrder, handleWarning, handleOrderStatus]);

  /* =========================================================
     CART & PUSH NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    subscribeToPush();
  }, [user]);

  /* =========================================================
     ADMIN SOCKET ROOM (with reconnect handling)
  ========================================================= */

  useEffect(() => {
    if (!socket || user?.role !== "admin") return;

    const joinAdmin = () => socket.emit("admin");

    if (socket.connected) joinAdmin();
    socket.on("connect", joinAdmin);

    return () => {
      socket.off("connect", joinAdmin);
    };
  }, [socket, user?.role]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{ top: 24, right: 24 }}
        toastOptions={{ duration: 4000 }}
      />

      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

export default App;