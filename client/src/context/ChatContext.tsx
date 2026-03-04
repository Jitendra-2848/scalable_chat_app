import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { ChatContextType, User, Message } from "../types/index";
import { SocketContext } from "./socket";
import { api } from "../utils/axios";

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messagesMap, setMessagesMap] = useState<
    Record<string, Message[]>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUser] = useState<User[]>([]);

  const { sendMsg } = useContext(SocketContext)!;

  // ✅ Fetch all users
  const getAllUser = useCallback(async () => {
    try {
      const result = await api.get("/auth/getAllUser");
      // setUser(result.data.data.rows); 
    } catch (error) {
      console.log(error);
    }
  }, []);

  // Optional: auto load users on mount
  useEffect(() => {
    getAllUser();
  }, [getAllUser]);
  console.log(users)

  // ✅ Select user
  const selectUser = useCallback((user: User) => {
    setSelectedUser(user);

    // Ensure chat history exists
    setMessagesMap((prev) => ({
      ...prev,
      [user.id]: prev[user.id] ?? [],
    }));
  }, []);

  // ✅ Current messages
  const messages = useMemo(() => {
    if (!selectedUser) return [];
    return messagesMap[selectedUser.id] ?? [];
  }, [selectedUser, messagesMap]);

  // ✅ Send message (clean & correct)
  const sendMessage = useCallback(
    (msg: string) => {
      if (!selectedUser || !msg.trim()) return;

      const exists = users.some((u) => u.id === selectedUser.id);
      if (!exists) {
        setUser((prev) => [...prev, selectedUser]);
      }
      const newMsg: Message = {
        id:selectedUser.id,
        message: msg,
        time: new Date(),
        read: false,
        sendedbyme: true,
        exist:exists,
      };
      // Update local state
      setMessagesMap((prev) => ({
        ...prev,
        [selectedUser.id]: [
          ...(prev[selectedUser.id] ?? []),
          newMsg,
        ],
      }));

      // Send via socket
      sendMsg(newMsg);
    },
    [selectedUser, sendMsg]
  );

  // ✅ Search users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    return users.filter((u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // ✅ Context value
  const value = useMemo(
    () => ({
      selectedUser,
      selectUser,
      messages,
      sendMessage,
      users,
      searchQuery,
      setSearchQuery,
      filteredUsers,
      getAllUser,
    }),
    [
      selectedUser,
      selectUser,
      messages,
      sendMessage,
      users,
      searchQuery,
      filteredUsers,
      getAllUser,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};