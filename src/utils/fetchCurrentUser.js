import Axios from "@/utils/axios";

/**
 * Fetch current user profile from the API
 * @returns {Promise<Object|null>} User Data or null if failed
 */
async function fetchCurrentUser() {
    try {
        const response = await Axios.get("/auth/user-profile");
        return response.data.user;
    } catch (error) {
        console.error("Failed to fetch current user", error);
        return null;
    }
}

export default fetchCurrentUser