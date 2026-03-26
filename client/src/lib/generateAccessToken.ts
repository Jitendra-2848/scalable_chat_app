import { api } from "../utils/axios";

export const Token = async() => {
    try {
        const data = await api.get("/auth/refresh_token");
        console.log(data)
        return data.data.token;
    } catch (error) {
        console.log(error);
        throw new Error("something went wrong... please re-login....");
    }
}