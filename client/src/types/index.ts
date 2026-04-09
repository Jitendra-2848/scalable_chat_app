import { Socket } from "socket.io-client";

// Unified interface - all users normalized to this format
export interface User {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  isonline?: boolean;
  last_message?: string;
  last_message_time?:string;
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
 status: "pending" | "sent" | "delivered" | "read" | "failed";
  last_message?: string;
  last_message_time?: Date | string;
  conversation_id?: number;
    file_url?: string;       // Add
  file_type?: string;      // Add
  file_name?: string; 
}
export interface ChatContextType {
  selectedUser: User | null;
  selectUser: (rawUser: any) => void;
  updateSelectedUserConvId: (convId: number) => void; // NEW
  users: User[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredUsers: User[];
  getAllUser: () => Promise<void>;
  updateSidebarWithNewMessage: (userId: number, lastMessage: string, lastMessageTime: string) => void;
  handleTyping: () => void;
  typingUsers: Record<number, boolean>;
  onlineUser: number[];
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
    isonline: rawUser.isonline,
    last_message: rawUser.lastMessage || rawUser.last_message,
    last_message_time: rawUser.last_message_time,
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
    getuser: () => Promise<boolean>,
    userdetail: {
        name: string,
        email: string,
        id: number,
    } | null,
    auth: boolean;
    logout : () => void;
    userSearch : (search:any) => void;
    searchUserData:user_info[];
    search:string;

}

export interface MessageContextType {
  messages: Message[];
  sendMessage: (msg: string) => void;
  fetchOlderMessages: () => Promise<void>;
  hasMore: boolean;
  markAsRead: (messageId: string, senderId: number) => void;
  hasMoreChats:boolean,
}

export interface user_info{
  id:number,
  email:string,
  name:string,
  pass?:string,
}