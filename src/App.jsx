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
import { addOrder } from "./features/order/orderSlice.js";

function App() {
  const dispatch = useDispatch();

  const socket = useSocket();

  const { user, accessToken } = useSelector(
    (state) => state.auth
  );

  const { orders } = useSelector(
    (state) => state.orders
  );

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    if (!accessToken) return;

    dispatch(getUser());
  }, [accessToken, dispatch]);

  /* =========================================================
     USER ORDER ROOMS
     
     Admin doesn't need to join every user order room.
  ========================================================= */

  useEffect(() => {
    if (!socket) return;

    if (!user) return;

    if (user.role === "admin") return;

    if (!orders?.length) return;

    orders.forEach(({ _id }) => {
      if (!_id) return;

      socket.emit("userOrder", _id);
    });
  }, [
    socket,
    user?.role,
    user?._id,
    orders,
  ]);

  /* =========================================================
     NEW ORDER
  ========================================================= */

  const handleNewOrder = useCallback(
    async (order) => {
      if (!order?._id) {
        console.warn(
          "⚠️ newOrder received without valid order"
        );

        return;
      }

      console.log(
        "🆕 NEW ORDER RECEIVED:",
        order
      );

      /* -----------------------------------------------------
         SOUND
      ----------------------------------------------------- */

      playSound?.(sounds.newOrder);

      /* -----------------------------------------------------
         TOAST
      ----------------------------------------------------- */

      showToast({
        type: "adminOrder",
        message: `${order.items?.length || 0} items received`,
        amount: order.totalPrice,
      });

      /* -----------------------------------------------------
         REDUX
      ----------------------------------------------------- */

      dispatch(addOrder(order));

      /* -----------------------------------------------------
         PRINT
      ----------------------------------------------------- */

      try {
        await printOrder(order);

        console.log(
          "✅ Order printed successfully:",
          order._id
        );

        showToast({
          type: "success",
          message: "Order printed successfully",
        });
      } catch (error) {
        console.error(
          "❌ Order printing failed:",
          error
        );

        showToast({
          type: "error",
          message:
            "Order received, but printing failed",
        });
      }
    },
    [dispatch]
  );

  /* =========================================================
     LOW STOCK
  ========================================================= */

  const handleWarning = useCallback((data) => {
    if (!data) return;

    playSound?.(sounds.lowStock);

    showToast({
      type: "lowStock",
      message: `${data.name} is running low on stock (${data.color
        } - ${data.size})`,
    });
  }, []);

  /* =========================================================
     ORDER STATUS
  ========================================================= */

  const handleOrderStatus = useCallback((data) => {
    if (!data) return;

    playSound?.(sounds.orderStatus);

    showToast({
      type: "orderStatus",
      message:
        data.body ||
        `Order status updated to ${data.status}`,
    });
  }, []);

  /* =========================================================
     SOCKET EVENTS
  ========================================================= */

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "newOrder",
      handleNewOrder
    );

    socket.on(
      "warning",
      handleWarning
    );

    socket.on(
      "orderStatus",
      handleOrderStatus
    );

    return () => {
      socket.off(
        "newOrder",
        handleNewOrder
      );

      socket.off(
        "warning",
        handleWarning
      );

      socket.off(
        "orderStatus",
        handleOrderStatus
      );
    };
  }, [
    socket,
    handleNewOrder,
    handleWarning,
    handleOrderStatus,
  ]);

  /* =========================================================
     CART
  ========================================================= */

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  /* =========================================================
     PUSH NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    if (!user) return;

    subscribeToPush();
  }, [user]);

  /* =========================================================
     ADMIN SOCKET ROOM
  ========================================================= */

  useEffect(() => {
    if (!socket) return;

    if (user?.role !== "admin") return;

    socket.emit("admin");


  }, [
    socket,
    user?.role,
  ]);

  /* =========================================================
     UI
  ========================================================= */

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