import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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

    return {
        user,
        isUserLoggedIn,
        userFullName,
        setUser
    }
});