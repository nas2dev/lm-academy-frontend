import Axios from "@/utils/axios"


export async function logoutUser() {
    try {
        await Axios.post('/auth/logout');
        console.log("Logout successful - token invalidated on server")
    } catch (error) {
        console.warn("Backend logout failed", error);
    } finally {
        localStorage.removeItem("lm-access-token");
        console.log("I WILL ALWAYS BE HERE");
    }
}