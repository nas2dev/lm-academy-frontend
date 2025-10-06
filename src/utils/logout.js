import Axios from "@/utils/axios"
import router from "@/router";
import { useUserStore } from "@/stores/useUserStore";
export async function logoutUser(redirectToLogin = true) {
    const userStore = useUserStore();

    try {
        await Axios.post('/auth/logout');
        console.log("Logout successful - token invalidated on server")
    } catch (error) {
        console.warn("Backend logout failed", error);
    } finally {
        userStore.localLogout();
        if (redirectToLogin) {
            router.push({ name: "LoginPage" });
        }
    }
    return true;
}

export async function logoutUserSilently() {
    return await logoutUser(false)
}


// logoutUser(false) -> nuk kemi me pas ridirektim (homepage /)
// logoutUser(true) => kemi me pas ridirektim (login page)
// logoutUser() => kemi me pas ridirektim (login page)