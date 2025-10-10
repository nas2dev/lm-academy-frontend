<script setup>
import { onMounted, ref, computed } from 'vue'
import AuthRedirect from '@/components/Auth/General/AuthRedirect.vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import EyeIcon from '@/assets/fonts/feather-icons/icons/eye.svg?component'
import EyeOffIcon from '@/assets/fonts/feather-icons/icons/eye-off.svg?component'
import Axios from '@/utils/axios'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const password = ref('')
const passwordConfirmation = ref('')

const isLoading = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const token = ref('')
const email = ref('')

const isFormValid = computed(() => {
  return password.value.length >= 8 && password.value === passwordConfirmation.value
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error('Form is invalid')
  }

  isLoading.value = true

  try {
    const response = await Axios.post('/auth/reset-password', {
      token: token.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })

    if (response.data.success) {
      toast.success('Password reset successfully!')
      router.push({ name: 'LoginPage' })
    }
  } catch (error) {
    console.error('error', error)
    const errorMessage = error?.response?.data?.message || 'Failed to verify reset link'
    toast.error(errorMessage)
    router.push({ name: 'LoginPage' })
  } finally {
    isLoading.value = false
  }
}

const verifyResetToken = async () => {
  try {
    const response = await Axios.post('/auth/verify-reset-token', {
      email: email.value,
      token: token.value,
    })

    console.log('response', response)

    if (!response.data.success) {
      toast.error(response?.data?.message || 'Reset link is invalid')
      router.push({ name: 'LoginPage' })
    }
  } catch (error) {
    console.error('error', error)
    const errorMessage = error?.response?.data?.message || 'Failed to verify reset link'
    toast.error(errorMessage)
    router.push({ name: 'LoginPage' })
  }
}

onMounted(() => {
  token.value = route.query.token
  email.value = route.query.email
  verifyResetToken()

  if (!token.value || !email.value) {
    toast.error('Invalid reset link')
    router.push({ name: 'ForgetPasswordPage' })
  }
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const togglePasswordConfirmationVisibility = () => {
  showPasswordConfirmation.value = !showPasswordConfirmation.value
}
</script>
<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-4">
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
          :disabled="isLoading"
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

    <div class="mb-4">
      <label for="password_confirmation" class="block text-sm mb-2 text-gray-400"
        >Password Confirmation</label
      >
      <div class="relative">
        <input
          v-model="passwordConfirmation"
          :type="showPasswordConfirmation ? 'text' : 'password'"
          id="password_confirmation"
          placeholder="Password"
          class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
          aria-describedby="hs-input-helper-text"
          required
          :disabled="isLoading"
          minlength="8"
        />

        <button
          type="button"
          @click="togglePasswordConfirmationVisibility"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <EyeIcon v-if="!showPasswordConfirmation" />
          <EyeOffIcon v-else />
        </button>
      </div>
    </div>

    <!-- button -->
    <div class="grid my-6">
      <button
        type="submit"
        class="btn py-[10px] text-base text-white font-medium hover:bg-blue-700"
        :disabled="isLoading || !isFormValid"
        :class="{ 'opacity-50 cursor-not-allowed': isLoading || !isFormValid }"
      >
        {{ isLoading ? 'Sending ...' : 'Reset Password' }}
      </button>
    </div>

    <!-- redirect -->
    <AuthRedirect path="LoginPage" page-title="Login Page" />
  </form>
</template>
