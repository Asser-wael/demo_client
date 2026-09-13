import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (token) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      auth: {
        token,
      },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [token]);

  return socket;
};

export default useSocket;