import axios from "axios"; 

export const Token = async (): Promise<string> => {
    try {
        const { data } = await axios.get(
            "http://localhost:8000/auth/refresh_token",
            { withCredentials: true }
        );
        return data.token;
    } catch (error) {
        throw new Error("Session expired... please re-login.");
    }
};