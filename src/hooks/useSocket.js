import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const useSocket = () => {
  // ✅ ناخد التوكن من الريدكس مباشرة
  const accessToken = useSelector(
    (state) => state.auth.accessToken
  );

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setSocket(null);
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: accessToken,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on("connect", () => {
      console.log(
        "✅ Socket connected:",
        socketInstance.id
      );
    });

    socketInstance.on("connect_error", (error) => {
      console.error(
        "❌ Socket connect_error:",
        error.message
      );
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [accessToken]);

  return socket;
};

export default useSocket;