import axios from 'axios'
import { mirrorRequest } from './refreshToken';

const Axios = axios.create({
    baseURL: import.meta.env.NODE_ENV === "production" ?
        'https://learnmoreacademy.com/api' :
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
                localStorage.removeItem('lm-access-token')
                return Promise.reject(error);
            }

            // Handle unauthorized error
            if (message === "Unauthorized") {
                console.log("Unauthorized error detected");
                localStorage.removeItem('lm-access-token')
                window.location.href = '/login'
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
            localStorage.removeItem('lm-access-token')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default Axios;