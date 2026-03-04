import { createContext, useRef, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../types";
import { api } from "../utils/axios";

// Types
interface ChildrenInterface {
  children: ReactNode;
}

interface SocketContextInterface {
  socket: Socket | null;
  sendMsg: (msg: Message) => void; // or your custom type
}

// Context
export const SocketContext = createContext<SocketContextInterface | undefined>(undefined);

// Provider
export const SocketProvider = ({ children }: ChildrenInterface) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket once
    socketRef.current = io("http://localhost:8000");

    // Optional: handle connection events
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
    });

    return () => {
      // Cleanup on unmount
      socketRef.current?.disconnect();
    };
  }, []);

  // Emit function
  const sendMsg = async(msg: Message) => {
    socketRef.current?.emit("message", msg);
    const result = await api.post(`/message/${msg.id}`,msg);
    console.log(result.data);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, sendMsg }}>
      {children}
    </SocketContext.Provider>
  );
};