<script setup>
import { ref } from 'vue'
import AuthRedirect from '@/components/Auth/General/AuthRedirect.vue'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const email = ref('')
const isLoading = ref(false)
const toast = useToast()
const router = useRouter()

const handleSubmit = async () => {
  isLoading.value = true

  try {
    const data = {
      email: email.value,
    }
    const response = await Axios.post('/auth/forgot-password', data)
    console.log('response', response)

    if (response.status === 200) {
      toast.success(response.data.message)
      router.push({ name: 'LoginPage' })
    }
  } catch (error) {
    console.error('error', error)
    const errorObj = error?.response?.data?.errors
    if (errorObj && typeof errorObj === 'object') {
      // Iterate through all validation errors and show each one
      for (const field in errorObj) {
        if (Array.isArray(errorObj[field])) {
          errorObj[field].forEach((msg) => {
            toast.error(msg)
          })
        } else if (errorObj[field]) {
          toast.error(errorObj[field])
        }
      }
    } else {
      const errorMessage = error?.response?.data?.message || 'Failed to send reset email'
      toast.error(errorMessage)
    }
  } finally {
    isLoading.value = false
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

    <!-- button -->
    <div class="grid my-6">
      <button
        type="submit"
        class="btn py-[10px] text-base text-white font-medium hover:bg-blue-700"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Sending ...' : 'Send Reset Link' }}
      </button>
    </div>

    <!-- redirect -->
    <AuthRedirect path="LoginPage" page-title="Login Page" />
  </form>
</template>
