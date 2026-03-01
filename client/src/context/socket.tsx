import { createContext, useRef, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../types";

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
  const sendMsg = (msg: Message) => {
    socketRef.current?.emit("message", msg);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, sendMsg }}>
      {children}
    </SocketContext.Provider>
  );
};