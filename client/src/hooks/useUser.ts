import { useContext } from "react";
import { UserInfo } from "../context/User"

export const useUser = ()=>{
    const context = useContext(UserInfo)
    // if(!context){
    //     throw new Error('User info cannot be used its null undefined');
    // }
    return context;
}