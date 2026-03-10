import { createContext, useState } from "react";
import { childrenInterface } from "../types";

interface MessageContextType {
  val: string;
  id?:string,
  profile_pic?:string,
  username?:string,
  getmsg:Function,
  msgload:boolean,
  messages:any,
} 

export const MessageContext =
  createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: childrenInterface) => {
  const val = "xyz";
  const [messages,setmessages] = useState([])
  const [msgload,setmsgload] = useState<boolean>(false) 
  const getmsg = async (id:string) => {
    await fetch(`http://localhost:8000/message/${id}`)
    .then((res)=>{
      setmsgload(true)
      return res.json();
    })  
    .then((res)=>{
      setmessages(res)
      setmsgload(false)
    })
    .catch((e)=>{
      console.log(e);
      setmsgload(false)
    })
  }
  return (
    <div>
      <MessageContext.Provider value={{ val,getmsg,msgload,messages }}>
        {children}
      </MessageContext.Provider>
    </div>
  );
};