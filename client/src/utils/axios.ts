import axios from "axios";
import { Token } from "../lib/generateAccessToken";
import {
    getAccessToken,
    setAccessToken,
    clearAccessToken
} from "../hooks/TokenManagement";

export const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
});
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
api.interceptors.response.use(
    (response) => response,  // 
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const newToken = await Token();
                setAccessToken(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                clearAccessToken();
                window.location.href = "/log";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);