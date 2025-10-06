import Axios from "@/utils/axios"
import { useUserStore } from "@/stores/useUserStore";

async function refreshToken() {
    try {
        const response = await Axios.post('/auth/refresh')

        console.log("Refresh token response", response);
        const { access_token: newToken, user } = response.data;

        console.log("user", user);
        localStorage.setItem('lm-access-token', newToken)
        return newToken;
    } catch (error) {
        console.log("Refresh token error", error);
        const userStore = useUserStore();
        userStore.logout()
        return Promise.reject(error);
    }
}

async function mirrorRequest(originalRequest) {
    const newToken = await refreshToken();

    if (!newToken) {
        window.location.href = '/login';
        return Promise.reject(new Error("Token refresh failed"))
    }

    originalRequest.headers['Authorization'] = `Bearer ${newToken}`

    return Axios(originalRequest)
}


export { refreshToken, mirrorRequest }