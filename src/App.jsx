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
  applyOrderStatusFromSocket,
  removeOrderFromSocket,
} from "./features/order/orderSlice.js";
import useApplyTheme from "./hooks/useApplyTheme.js";
import { fetchSettings } from "./features/settings/settingsSlice.js";

function App() {
  useApplyTheme();
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector(
    (state) => state.auth
  );

  const socket = useSocket(accessToken);

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    if (!accessToken) return;
    dispatch(getUser());
  }, [accessToken, dispatch]);

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

      /* -----------------------------------------------------
         SOUND
      ----------------------------------------------------- */

      playSound?.(sounds.newOrder);

      /* -----------------------------------------------------
         TOAST
      ----------------------------------------------------- */

      showToast({
        type: "adminOrder",
        message: `${order.items?.length || 0} dishes received`,
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

        showToast({
          type: "success",
          message: "Order ticket printed successfully",
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
      message: `${data.name} is running low on stock (${data.variant
        } - ${data.size})`,
    });
  }, []);

  /* =========================================================
     ORDER STATUS
  ========================================================= */

  const handleOrderStatus = useCallback((data) => {
    if (!data) return;

    playSound?.(sounds.orderStatus);

    dispatch(
      applyOrderStatusFromSocket({
        orderId: data.orderId,
        status: data.status,
      })
    );

    showToast({
      type: "orderStatus",
      message:
        data.body ||
        `Order status updated to ${data.status}`,
    });
  }, [dispatch]);

  /* =========================================================
     ORDER DELETED
  ========================================================= */

  const handleOrderDeleted = useCallback((data) => {
    if (!data) return;

    dispatch(removeOrderFromSocket({ orderId: data.orderId }));

    showToast({
      type: "orderStatus",
      message: "One of your orders was removed by the restaurant.",
    });
  }, [dispatch]);

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

    socket.on(
      "orderDeleted",
      handleOrderDeleted
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

      socket.off(
        "orderDeleted",
        handleOrderDeleted
      );
    };
  }, [
    socket,
    handleNewOrder,
    handleWarning,
    handleOrderStatus,
    handleOrderDeleted,
  ]);

  /* =========================================================
     CART
  ========================================================= */

  useEffect(() => {
    if (!user) return;
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
    dispatch(fetchSettings());
  }, [dispatch]);
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