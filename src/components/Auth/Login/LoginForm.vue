<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/useUserStore'
import AuthRedirect from '@/components/Auth/General/AuthRedirect.vue'
import EyeIcon from '@/assets/fonts/feather-icons/icons/eye.svg?component'
import EyeOffIcon from '@/assets/fonts/feather-icons/icons/eye-off.svg?component'
import Axios from '@/utils/axios'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const showPassword = ref(false)
const email = ref('')
const password = ref('')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  try {
    const data = {
      email: email.value,
      password: password.value,
    }
    const response = await Axios.post('/auth/login', data)

    if (response.status === 200) {
      toast.success('Login successful')
      const access_token = response?.data?.access_token
      const authUser = response?.data?.user
      userStore.setUser(authUser)
      localStorage.setItem('lm-access-token', access_token)
      router.push({ name: 'DashboardPage' })
    }
  } catch (error) {
    console.error('error', error)
    const errorMessage = error?.response?.data?.error || 'Login Failed'
    toast.error(errorMessage)
  }
}
</script>
<template>
  <form @submit.prevent="handleSubmit">
    <!-- username -->
    <div class="mb-4">
      <label for="forEmail" class="block text-sm mb-2 text-gray-400">Email</label>
      <input
        v-model="email"
        type="email"
        id="forEmail"
        placeholder="Enter e-mail address"
        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
        aria-describedby="hs-input-helper-text"
        required
      />
    </div>
    <!-- password -->
    <div class="mb-6">
      <label for="forPassword" class="block text-sm mb-2 text-gray-400">Password</label>
      <div class="relative">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          id="forPassword"
          placeholder="Password"
          class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
          aria-describedby="hs-input-helper-text"
          required
        />
        <button
          type="button"
          @click="togglePasswordVisibility"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <EyeIcon v-if="!showPassword" />
          <EyeOffIcon v-else />
        </button>
      </div>
    </div>
    <!-- checkbox -->
    <div class="flex justify-end">
      <a href="../" class="text-sm font-semibold text-authBlue hover:text-blue-700"
        >Forgot Password ?</a
      >
    </div>
    <!-- button -->
    <div class="grid my-6">
      <button
        type="submit"
        class="btn py-[10px] text-base text-white font-medium hover:bg-blue-700"
      >
        Sign In
      </button>
    </div>

    <!-- redirect -->
    <AuthRedirect path="HomePage" page-title="Home Page" />
  </form>
</template>
