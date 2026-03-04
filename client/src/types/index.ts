import { Socket } from "socket.io-client";

export interface User {
  id: number;
  name: string;
  avatar?: string;
  isonline?: boolean;
  lastMessage?: string;
  lastSeen?: string;
}

export interface Message {
  id:number,
  message: string;
  time: Date;
  read: boolean;
  sendedbyme: boolean;
  exist:boolean,
}

export interface ChatContextType {
  selectedUser: User | null;
  selectUser: (user: User) => void;
  messages: Message[];
  sendMessage: (msg: string) => void;
  users: User[];
  getAllUser: ()=> void,
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredUsers: User[];
}

export interface socketconInterface {
    socket : Socket | null,
    sendmsg:(msg:Message)=> void,

}

export interface childrenInterface {
  children:React.ReactNode,
}

export interface login_data{
  email:string,
  pass:string
} 
export interface Register_data{
  email:string,
  name:string,
  pass:string
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