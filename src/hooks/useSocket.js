import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (accessToken) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setSocket(null);
      return;
    }

    const socketInstance = io(
      import.meta.env.VITE_SOCKET_URL,
      {
        auth: {
          token: accessToken,
        },

        withCredentials: true,

        // ابدأ polling وبعدها يرقى لـ websocket
        transports: ["polling", "websocket"],

        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      }
    );

    // =========================
    // CONNECT
    // =========================
    socketInstance.on("connect", () => {
      console.log(
        "🟢 Socket connected:",
        socketInstance.id
      );
    });

    // =========================
    // CONNECT ERROR
    // =========================
    socketInstance.on("connect_error", (error) => {
      console.error(
        "🔴 Socket connection error:",
        error.message
      );
    });

    // =========================
    // DISCONNECT
    // =========================
    socketInstance.on("disconnect", (reason) => {
      console.log(
        "🟡 Socket disconnected:",
        reason
      );
    });

    setSocket(socketInstance);

    // =========================
    // CLEANUP
    // =========================
    return () => {
      console.log("🔌 Closing socket...");

      socketInstance.removeAllListeners();
      socketInstance.disconnect();

      setSocket(null);
    };
  }, [accessToken]);

  return socket;
};

export default useSocket;