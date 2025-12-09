import axios from 'axios'
import { mirrorRequest } from './refreshToken';
import { useUserStore } from "@/stores/useUserStore"
const Axios = axios.create({
    baseURL: import.meta.env.PROD === "production" ?
        'https://lm-prod-api.codingtrainingacademy.com/api' :
        'http://127.0.0.1:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});


Axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('lm-access-token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)

const REFRESH_ERROR_MESSAGE = "Token has expired and can no longer be refreshed"

Axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        console.log("error", error);
        const originalRequest = error.config;

        const response = error.response;
        const status = response.status;
        const errorMessage = response?.data?.error;
        const message = response?.data?.message;

        console.log("Api Error", { status, errorMessage, message, response });

        //  prevent infinite loops
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        if (status === 401) {
            // Handle login error first
            if (message === "Your email or password is invalid") {
                console.log("Login error detected");
                const userStore = useUserStore();
                userStore.localLogout();
                return Promise.reject(error);
            }

            // Handle unauthorized error
            if (message === "Unauthorized") {
                console.log("Unauthorized error detected");
                const userStore = useUserStore()
                userStore.logout(true)
                return Promise.reject(error);
            }

            if (message === "Token expired" || message === "token expired") {
                console.log("Token expired error detected");
                const hasToken = localStorage.getItem('lm-access-token');
                if (hasToken && !originalRequest._retry) {
                    console.log("Token found, attempting to refresh");
                    originalRequest._retry = true;
                    // 1. duhet me thirr refresh token metoden
                    // 2. duhet me thirr kerkesen origjinale
                    return mirrorRequest(originalRequest)
                }
            }

        }

        if (status === 500 && message === REFRESH_ERROR_MESSAGE) {
            console.log("Token has expired and can no longer be refreshed");
            const userStore = useUserStore()
            userStore.logout(true)
        }

        return Promise.reject(error)
    }
)

export default Axios;