import React, { createContext, useState, useMemo, useCallback, useContext } from 'react';
import { ChatContextType, User, Message } from '../types/index';
import { SocketContext } from './socket';
import { api } from '../utils/axios';

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>();
  const [searchQuery, setSearchQuery] = useState('');
  const { sendMsg } = useContext(SocketContext)!;
  const [users,setUser] = useState([]);
  const getAllUser = async() => {
    try {
      const result = await api.get("/auth/getAllUser");
      const x = result.data.data;
      console.log(x);
    } catch (error) {
      console.log(error);
    }
  } 

  const selectUser = useCallback((user: User) => {
    setSelectedUser(user);
    // Initialize empty chat if no history
    setMessagesMap((prev) => ({
      ...prev,
      [user.user_id]: prev[user.user_id] || [],
    }));
  }, []);

  const messages = useMemo(() => {
    if (!selectedUser) return [];
    return messagesMap[selectedUser.user_id] || [];
  }, [selectedUser, messagesMap]);

  const sendMessage = useCallback(
    (msg: string) => {
      if (!selectedUser || !msg.trim()) return;
      const newMsg: Message = {
        message: msg,
        time: new Date(),
        read: false,
        sendedbyme: true,
      };
      setMessagesMap((prev) => ({
        ...prev,
        [selectedUser.user_id]: [...(prev[selectedUser.user_id] || []), newMsg],
      }));
      sendMsg(newMsg);
    },
    [selectedUser]
  );

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return users.filter((u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

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
    [selectedUser, selectUser, messages, sendMessage, users, searchQuery, filteredUsers,getAllUser]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};