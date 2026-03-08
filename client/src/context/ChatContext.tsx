import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useContext,
  useEffect,
} from "react";

import { ChatContextType, User, Message, normalizeUser } from "../types/index";
import { SocketContext } from "./socket";
import { api } from "../utils/axios";

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<number, Message[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUser] = useState<User[]>([]);

  const { sendMsg } = useContext(SocketContext)!;

  // Normalize all users on initial load
  const getAllUser = useCallback(async () => {
    try {
      const result = await api.get("/user/");
      const normalizedUsers = (result.data.data || []).map((u: any) => normalizeUser(u));
      setUser(normalizedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  // Single function handles all user sources - normalization prevents confusion
  const selectUser = useCallback(
    async (rawUser: any) => {
      try {
        const user = normalizeUser(rawUser);

        if (messagesMap[user.id]) {
          setSelectedUser(user);
          addUserIfNotExists(user);
          return;
        }

        // Backend finds/creates conversation if not found
        const result = await api.post("/message/getmsg", {
          conversation_id: user.conversation_id ?? null,
          user_id: user.id,
        });

        setMessagesMap((prev) => ({
          ...prev,
          [user.id]: result.data.data || [],
        }));

        const userWithConv: User = {
          ...user,
          conversation_id: result.data.conversation_id || user.conversation_id,
        };

        setSelectedUser(userWithConv);
        addUserIfNotExists(userWithConv);
      } catch (err) {
        console.error("Error selecting user:", err);
      }
    },
    [messagesMap]
  );

  // Prevent duplicates by checking unified id
  const addUserIfNotExists = useCallback((user: User) => {
    setUser((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev : [...prev, user];
    });
  }, []);

  const messages = useMemo(() => {
    if (!selectedUser) return [];
    return messagesMap[selectedUser.id] || [];
  }, [selectedUser, messagesMap]);

  // Include all required Message fields
  const sendMessage = useCallback(
    (msg: string) => {
      if (!selectedUser || !msg.trim()) return;
      const newMsg: Message = {
        id: selectedUser.id,
        message: msg,
        time: new Date(),
        read: false,
        sendedbyme: true,
        exist: true,
        conversation_id: selectedUser.conversation_id,
      };
      setMessagesMap((prev) => ({
        ...prev,
        [selectedUser.id]: [...(prev[selectedUser.id] || []), newMsg],
      }));

      sendMsg(newMsg);
    },
    [selectedUser, sendMsg]
  );

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter((u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const value = {
    selectedUser,
    selectUser,
    messages,
    sendMessage,
    users,
    searchQuery,
    setSearchQuery,
    filteredUsers,
    getAllUser,
  };

  useEffect(() => {
    getAllUser();
  }, [getAllUser]);

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};