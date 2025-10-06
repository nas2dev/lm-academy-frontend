import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { logoutUser, logoutUserSilently } from '@/utils/logout';

export const useUserStore = defineStore('user', () => {
    const user = ref({})

    const isUserLoggedIn = computed(() => {
        return !!user.value.id && !!localStorage.getItem('lm-access-token')
    });

    const userFullName = computed(() => {
        if (!user.value.first_name && !user.value.last_name) return ''
        return `${user.value.first_name} ${user.value.last_name}`
    })


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

    return {
        user,
        isUserLoggedIn,
        userFullName,
        setUser,
        logout,
        localLogout
    }
});