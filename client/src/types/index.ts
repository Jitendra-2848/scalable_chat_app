import { Socket } from "socket.io-client";

// Unified interface - all users normalized to this format
export interface User {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  isonline?: boolean;
  lastMessage?: string;
  lastSeen?: string;
  conversation_id?: number;
  typing?:boolean
}

export interface Message {
  id: string;
  message: string;
  created_at: Date | string;
  read: boolean;
  sender_id: number;
  receiver_id?: number;
  sendedbyme: boolean;
  status: "pending" | "sent" | "delivered" | "read";
  last_message?: string;
  last_message_time?: Date | string;
  conversation_id?: number;
}
export interface ChatContextType {
  selectedUser: User | null;
  selectUser: (user: any) => void;
  messages: Message[];
  sendMessage: (msg: string) => void;
  users: User[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredUsers: User[];
  getAllUser: () => void;
  addMessageFromSocket: (msg: Message) => void;
  handleTyping: () => void;
  typingUsers: Record<number, boolean>;
  onlineUser: any[];
  markAsRead: (messageId: string, senderId: number) => void;
}

// Converts user_id or id to unified id - single entry point for all user formats
export const normalizeUser = (rawUser: any): User => {
  const id = rawUser.user_id ?? rawUser.id;
  
  if (!id) {
    throw new Error('User must have either id or user_id');
  }

  return {
    id,
    name: rawUser.name,
    email: rawUser.email,
    avatar: rawUser.avatar,
    isOnline: rawUser.isonline,
    last_message: rawUser.lastMessage || rawUser.last_message,
    last_message_time: rawUser.last_message_time,
    lastSeen: rawUser.lastSeen || rawUser.last_seen,
    conversation_id: rawUser.conversation_id,
  };
};

export interface socketconInterface {
  socket: Socket | null;
  sendmsg: (msg: Message) => void;
  joining: (id:number) => void;
}

export interface childrenInterface {
  children: React.ReactNode;
}

export interface login_data {
  email: string;
  pass: string;
}

export interface Register_data {
  email: string;
  name: string;
  pass: string;
} 
export interface userInfoInterface {
    login: (data: any) => void,
    Register: (data: any) => void,
    getuser: (data: any) => void,
    userdetail: {
        name: string,
        email: string,
    },
    auth: boolean;
    logout : () => void;
    userSearch : (search:any) => void;
    

}

export interface user_info{
  id:number,
  email:string,
  name:string,
  pass?:string,
}