import { createContext, ReactNode, useEffect, useState } from "react"
import { login_data, Register_data, userInfoInterface, user_info } from "../types";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/axios";
import { hasRefreshToken } from "../hooks/TokenManagement";


interface userInfoInterfaceProvider {
    children: ReactNode;
}

interface searchUserDataFormat {
    name: string,
    email: string,
    id: number
}

export const UserInfo = createContext<userInfoInterface | null>(null);
export const UserInfoProvider = ({ children }: userInfoInterfaceProvider) => {
    const [userdetail, setuserdetail] = useState<searchUserDataFormat | null>({ name: "", email: "", id: 0 })
    const [searchUserData, setSearchUserData] = useState<user_info[]>([]);
    const [auth, setAuth] = useState(false);
    const [search, setSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.trim()) {
                userSearch(search);
                console.log(search);
                const result = await api.post("/user/getUser", { search });
                console.log(result.data);
                setSearchUserData(result.data.data)
            }
            else {
                setSearchUserData([]);
                return;
            }
        }, 500); // 1 second delay

        return () => clearTimeout(timer); // clear previous timer
    }, [search]);
    const navigate = useNavigate()
    const getuser = async (): Promise<boolean> => {
        try {
            const result = await api.get("/auth/get");
            setuserdetail(result.data.data);
            if (result.data?.data && result.status === 200) {
                setAuth(true);
                return true;  // ✅ Logged in
            }
            return false;
        } catch (error) {
            setAuth(false);
            setuserdetail(null);
            return false;
        }
    };
    const login = async (data: login_data) => {
        const { email, pass } = data;
        const newUser = { email, pass };
        const result = await api.post("/auth/log", newUser);
        if (result?.status == 200) {
            console.log("logged in successfully!!")
            setuserdetail(result.data.data)
            // setuserdetail(newUser);
            setAuth(true);
        }
    }
    const Register = async (data: Register_data) => {
        const { email, pass, name } = data;
        const newUser = { name, email, pass };
        const result = await api.post("/auth/create", newUser);
        if (result?.status == 200) {
            console.log("Register successfully!!")
            setuserdetail(result.data.data)
            setAuth(true);
        }
    }
    const logout = async () => {
        try {
            const result = await api.get("/auth/logout");
            console.log(result.data.message)
            setAuth(false)
            navigate("/log")
        } catch (error) {
            console.log(error)
        }
    }
    const userSearch = async (search: any) => {
        try {
            // console.log(search)
            // const result = await api.post("/user/getUser", search);
            // const x = result.data;
            // console.log(x);
            setSearch(search);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <UserInfo.Provider value={{ login, userdetail, auth, Register, getuser, logout, userSearch, searchUserData, search }}>
            {children}
        </UserInfo.Provider>
    )
}