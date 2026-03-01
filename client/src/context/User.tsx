import { createContext, ReactNode, useState } from "react"
import { login_data, Register_data, userInfoInterface } from "../types";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/axios";


interface userInfoInterfaceProvider {
    children: ReactNode;
}

export const UserInfo = createContext<userInfoInterface | null>(null);
export const UserInfoProvider = ({ children }: userInfoInterfaceProvider) => {
    const [userdetail, setuserdetail] = useState({ name: "", email: "", id:0 })
    const [auth, setAuth] = useState(false);
    const getuser = async()=>{
        try {
            const result = await api.get("/auth/get");
            setuserdetail(result.data.data)
            if(result.data?.data && result.status === 200){
                setAuth(true);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const login = async(data: login_data) => {
        const { email, pass } = data;
        const newUser = { email, pass };
        const result = await api.post("/auth/log", newUser);
        if(result?.status == 200){
            console.log("logged in successfully!!")
            setuserdetail(result.data.data)
            // setuserdetail(newUser);
            setAuth(true);
        }
    }
    const Register = async(data: Register_data) => {
        const { email, pass, name } = data;
        const newUser = { name, email, pass };
        const result = await api.post("/auth/create", newUser);
        if(result?.status == 200){
            console.log("Register successfully!!")
            setuserdetail(result.data.data)
            setAuth(true);
        }
    }
    return (
        <UserInfo.Provider value={{ login, userdetail, auth,Register,getuser }}>
            {children}
        </UserInfo.Provider>
    )
}