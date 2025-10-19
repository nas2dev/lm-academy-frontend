import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { logoutUser, logoutUserSilently } from '@/utils/logout';
import fetchCurrentUser from '@/utils/fetchCurrentUser';

export const useUserStore = defineStore('user', () => {
    const user = ref({})
    const isLoading = ref(false)
    const error = ref(null)

    const isUserLoggedIn = computed(() => {
        return !!user.value.id && !!localStorage.getItem('lm-access-token')
    });

    const userFullName = computed(() => {
        if (!user.value.first_name && !user.value.last_name) return ''
        return `${user.value.first_name} ${user.value.last_name}`
    })

    const userRole = computed(() => {
        return user.value?.roles?.[0]?.name || null
    });

    const isAdmin = computed(() => {
        return userRole.value === 'Admin'
    })

    const isUser = computed(() => {
        return userRole.value === 'User'
    })

    const hasRole = computed(() => {
        return (role) => userRole.value === role
    })

    function setLoading(loading) {
        isLoading.value = loading
    }

    function setError(errorMessage) {
        error.value = errorMessage
    }


    async function fetchUser() {
        setLoading(true)
        try {
            const userData = await fetchCurrentUser()
            if (userData) {
                setUser(userData)
            }
        } catch (error) {
            setError(error)
            console.error("Error fetching user: ", error)
        }
        finally {
            setLoading(false)
        }
    }

    function setUser(userData) {
        user.value = userData
    }

    async function logout(redirectToLogin = true) {
        if (redirectToLogin) {
            await logoutUser(true)
        }
        else {
            await logoutUserSilently()
        }
    }

    function localLogout() {
        user.value = {};
        localStorage.removeItem("lm-access-token");
    }

    function clearError() {
        error.value = null;
    }

    return {
        // state
        user,
        isLoading,
        error,

        // computed
        isUserLoggedIn,
        userFullName,
        userRole,
        isAdmin,
        isUser,
        hasRole,

        // actions
        setUser,
        setLoading,
        setError,
        logout,
        localLogout,
        fetchUser,
        clearError,
    }
});