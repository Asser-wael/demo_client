import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (token) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      auth: {
        token,
      },
    });

    setSocket(socketInstance);
console.log("done");

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return socket;
};

export default useSocket;