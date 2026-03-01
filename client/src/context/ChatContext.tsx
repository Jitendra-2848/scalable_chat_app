import React, { createContext, useState, useMemo, useCallback, useContext } from 'react';
import { ChatContextType, User, Message } from '../types/index';
import { SocketContext } from './socket';

export const ChatContext = createContext<ChatContextType | null>(null);

const DUMMY_USERS: User[] = [
  {
    user_id: '1',
    name: 'Jitendra',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'Hello bhai',
    lastSeen: '9:30 pm',
  },
  {
    user_id: '2',
    name: 'Rahul',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: false,
    lastMessage: 'Kya haal hai?',
    lastSeen: '8:00 pm',
  },
  {
    user_id: '3',
    name: 'Priya',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'See you tomorrow',
    lastSeen: '10:00 pm',
  },
  {
    user_id: '1',
    name: 'Jitendra',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'Hello bhai',
    lastSeen: '9:30 pm',
  },
  {
    user_id: '2',
    name: 'Rahul',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: false,
    lastMessage: 'Kya haal hai?',
    lastSeen: '8:00 pm',
  },
  {
    user_id: '3',
    name: 'Priya',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'See you tomorrow',
    lastSeen: '10:00 pm',
  },
  {
    user_id: '1',
    name: 'Jitendra',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'Hello bhai',
    lastSeen: '9:30 pm',
  },
  {
    user_id: '2',
    name: 'Rahul',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: false,
    lastMessage: 'Kya haal hai?',
    lastSeen: '8:00 pm',
  },
  {
    user_id: '3',
    name: 'Priya',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'See you tomorrow',
    lastSeen: '10:00 pm',
  },
  {
    user_id: '1',
    name: 'Jitendra',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'Hello bhai',
    lastSeen: '9:30 pm',
  },
  {
    user_id: '2',
    name: 'Rahul',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: false,
    lastMessage: 'Kya haal hai?',
    lastSeen: '8:00 pm',
  },
  {
    user_id: '3',
    name: 'Priya',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'See you tomorrow',
    lastSeen: '10:00 pm',
  },
  {
    user_id: '1',
    name: 'Jitendra',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'Hello bhai',
    lastSeen: '9:30 pm',
  },
  {
    user_id: '2',
    name: 'Rahul',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: false,
    lastMessage: 'Kya haal hai?',
    lastSeen: '8:00 pm',
  },
  {
    user_id: '3',
    name: 'Priya',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'See you tomorrow',
    lastSeen: '10:00 pm',
  },
  {
    user_id: '1',
    name: 'Jitendra',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'Hello bhai',
    lastSeen: '9:30 pm',
  },
  {
    user_id: '2',
    name: 'Rahul',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: false,
    lastMessage: 'Kya haal hai?',
    lastSeen: '8:00 pm',
  },
  {
    user_id: '3',
    name: 'Priya',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'See you tomorrow',
    lastSeen: '10:00 pm',
  },
  {
    user_id: '1',
    name: 'Jitendra',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'Hello bhai',
    lastSeen: '9:30 pm',
  },
  {
    user_id: '2',
    name: 'Rahul',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: false,
    lastMessage: 'Kya haal hai?',
    lastSeen: '8:00 pm',
  },
  {
    user_id: '3',
    name: 'Priya',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk9I4ShLVuwDVX2-9DHBxIjc0rm-mjbRlvVg&s',
    isonline: true,
    lastMessage: 'See you tomorrow',
    lastSeen: '10:00 pm',
  },
];

const DUMMY_MESSAGES: Message[] = [
  { message: 'hello', sendedbyme: true, time: new Date(), read: true },
  { message: 'hii', sendedbyme: false, time: new Date(), read: true },
  { message: 'kaisa chal raha hai', sendedbyme: false, time: new Date(), read: true },
  { message: 'bas badiya tu bata', sendedbyme: true, time: new Date(), read: true },
];

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({
    '1': DUMMY_MESSAGES,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const users = DUMMY_USERS;
  const { sendMsg } = useContext(SocketContext)!;

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
    if (!searchQuery.trim()) return users;
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
    }),
    [selectedUser, selectUser, messages, sendMessage, users, searchQuery, filteredUsers]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};