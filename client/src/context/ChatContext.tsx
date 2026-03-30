import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { ChatContextType, User, normalizeUser } from "../types/index";
import { api } from "../utils/axios";
import { useSocket } from "../hooks/useSocket";
import { hasRefreshToken } from "../hooks/TokenManagement";

export const ChatContext = createContext<ChatContextType | null>(null); // ✅ Typed

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
  const [onlineUser, setOnlineUsers] = useState<number[]>([]);

  const { socket } = useSocket();


  const getAllUser = useCallback(async () => {
    try {
      if (hasRefreshToken()) {
        const result = await api.get("/user/");
        const normalizedUsers = (result.data.data || []).map((u: any) =>
          normalizeUser(u)
        );
        setUsers(normalizedUsers);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  const selectUser = useCallback((rawUser: any) => {
    if (!rawUser) {
      setSelectedUser(null);
      return;
    }
    const user = normalizeUser(rawUser);
    setSelectedUser(user);

    // Add to sidebar if not exists
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev : [...prev, user];
    });
  }, []);

  const updateSelectedUserConvId = useCallback((convId: number) => {
    setSelectedUser((prev) => {
      if (!prev) return prev;
      return { ...prev, conversation_id: convId };
    });
  }, []);

  // 3. Update sidebar preview when a new message arrives
  const updateSidebarWithNewMessage = useCallback(
    (userId: number, lastMessage: string, lastMessageTime: string) => {
      setUsers((prev) => {
        if (!prev.some((u) => u.id === userId)) {
          return [
            ...prev,
            {
              id: userId,
              name: "Unknown",
              last_message: lastMessage,
              last_message_time: lastMessageTime,
            } as User,
          ];
        }
        return prev.map((u) =>
          u.id === userId
            ? { ...u, last_message: lastMessage, last_message_time: lastMessageTime }
            : u
        );
      });
    },
    []
  );

  // 4. Typing
  const handleTyping = useCallback(() => {
    if (selectedUser?.id) socket?.emit("typing", selectedUser.id);
  }, [socket, selectedUser]);

  // 5. Socket listeners (Online + Typing ONLY)
  useEffect(() => {
    if (!socket) return;

    const handleSocketTyping = (userId: number) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: true }));
      setTimeout(
        () => setTypingUsers((prev) => ({ ...prev, [userId]: false })),
        2000
      );
    };

    const handleOnlineUser = (onlineArray: number[]) =>
      setOnlineUsers(onlineArray);

    socket.on("onlineUsers", handleOnlineUser);
    socket.on("Typing", handleSocketTyping);
    socket.emit("get_online_users");

    return () => {
      socket.off("onlineUsers", handleOnlineUser);
      socket.off("Typing", handleSocketTyping);
    };
  }, [socket]);

  // 6. Search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter((u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  useEffect(() => {
    getAllUser();
  }, [getAllUser]);

  const value = useMemo(
    () => ({
      selectedUser,
      selectUser,
      updateSelectedUserConvId, // ✅ NEW
      users,
      searchQuery,
      setSearchQuery,
      filteredUsers,
      getAllUser,
      updateSidebarWithNewMessage,
      handleTyping,
      typingUsers,
      onlineUser,
    }),
    [
      selectedUser,
      selectUser,
      updateSelectedUserConvId,
      users,
      searchQuery,
      filteredUsers,
      getAllUser,
      updateSidebarWithNewMessage,
      handleTyping,
      typingUsers,
      onlineUser,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};