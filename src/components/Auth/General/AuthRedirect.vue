<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
const props = defineProps({
  path: {
    type: String,
    required: false,
    default: 'HomePage',
  },
  pageTitle: {
    type: String,
    required: false,
    default: 'Home',
  },
  isLogout: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const userStore = useUserStore()
const isLoggingOut = ref(false)

const handleLogout = async () => {
  if (!props.isLogout) return

  isLoggingOut.value = true

  try {
    await userStore.logout(true)
  } catch (error) {
    console.log('Logout error', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>
<template>
  <div class="flex justify-center gap-2 items-center">
    <p class="text-base font-semibold text-gray-400">
      {{ isLogout ? 'Switching Account' : 'Go to' }}
    </p>
    <router-link
      v-if="!isLogout"
      :to="{ name: path }"
      class="text-sm font-semibold text-authBlue hover:text-blue-700"
      >{{ pageTitle }}
    </router-link>

    <button
      v-else
      class="font-semibold text-authBlue hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      @click="handleLogout"
      :disabled="isLoggingOut"
    >
      {{ pageTitle }}
    </button>
  </div>
</template>
