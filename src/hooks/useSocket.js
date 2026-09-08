import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (accessToken) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    const socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      withCredentials: true,
      transports: ["polling", "websocket"],
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