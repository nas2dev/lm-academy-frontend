<script setup>
import { ref, onMounted } from 'vue'
import EyeIcon from '@/assets/fonts/feather-icons/icons/eye.svg?component'
import EyeOffIcon from '@/assets/fonts/feather-icons/icons/eye-off.svg?component'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import Axios from '@/utils/axios'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const showPassword = ref(false)
const showRepeatPassword = ref(false)
const isLoading = ref(false)
const isVerifying = ref(true)

const formData = ref({
  registration_code: '',
  firstName: '',
  lastName: '',
  gender: 'male',
  email: '',
  password: '',
  repeatPassword: '',
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
const toggleRepeatPasswordVisibility = () => {
  showRepeatPassword.value = !showRepeatPassword.value
}

const verifyToken = async () => {
  const token = route.query.token
  const email = route.query.email

  console.log({ token })
  console.log({ email })

  if (!token || !email) {
    toast.error('Invalid registration link')
    router.push({ name: 'LoginPage' })
  }

  try {
    const response = await Axios.post('/auth/verify-registration-token', {
      email,
      token,
    })

    console.log('response', response)
    if (response.status === 200) {
      formData.value.email = email
      formData.value.registrationCode = response?.data?.verificationToken?.code
      isVerifying.value = false
    }
  } catch (error) {
    console.error('Token verification error', error)
    const errorMessage = error?.response?.data?.message || 'Invalid or expired registration link'
    toast.error(errorMessage)
    router.push({ name: 'LoginPage' })
  }
}

onMounted(() => {
  verifyToken()
})

const handleSubmit = async () => {
  if (formData.value.password !== formData.value.repeatPassword) {
    toast.error('Passwords do not match')
    return
  }

  if (formData.value.password.length < 8) {
    toast.error('Password must be at least 8 characters long')
    return
  }

  isLoading.value = true

  try {
    const data = {
      registration_code: formData.value.registrationCode,
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
      gender: formData.value.gender,
      email: formData.value.email,
      password: formData.value.password,
      password_confirmation: formData.value.repeatPassword,
    }

    const response = await Axios.post('/auth/register', data)
    console.log('response', response)
    if (response.status === 201) {
      toast.success('Registration successful! Please complete your profile.')
      const access_token = response?.data?.access_token

      localStorage.setItem('lm-access-token', access_token)
      router.push({ name: 'DashboardPage' })
    }
  } catch (error) {
    console.error('error', error)
    const errorMessage = error?.response?.data?.message || 'Registration failed. Please try again.'
    toast.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="isVerifying" class="text-center py-8">
    <p class="text-gray-400">Verifying invitation</p>
  </div>
  <form v-else @submit.prevent="handleSubmit">
    <div class="mb-4">
      <label for="registrationCode" class="block text-sm mb-2 text-gray-400"
        >Registration Code</label
      >
      <input
        v-model="formData.registrationCode"
        type="text"
        id="registrationCode"
        placeholder="Enter registration code"
        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
        aria-describedby="hs-input-helper-text"
        required
        readonly
      />
    </div>

    <div class="mb-4">
      <label for="firstName" class="block text-sm mb-2 text-gray-400">First Name</label>
      <input
        v-model="formData.firstName"
        type="text"
        id="firstName"
        placeholder="Enter First Name"
        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
        aria-describedby="hs-input-helper-text"
        required
        :disabled="isLoading"
      />
    </div>

    <div class="mb-4">
      <label for="lastName" class="block text-sm mb-2 text-gray-400">Last Name</label>
      <input
        v-model="formData.lastName"
        type="text"
        id="lastName"
        placeholder="Enter Last Name"
        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
        aria-describedby="hs-input-helper-text"
        required
        :disabled="isLoading"
      />
    </div>

    <div class="mb-4">
      <label for="gender" class="block text-sm mb-2 text-gray-400">Gender</label>
      <div class="flex gap-4">
        <label class="flex items-center cursor-pointer">
          <input
            type="radio"
            value="male"
            class="mr-2"
            v-model="formData.gender"
            :disabled="isLoading"
          />
          <span class="text-sm text-gray-700">Male</span>
        </label>

        <label class="flex items-center cursor-pointer">
          <input
            type="radio"
            value="female"
            class="mr-2"
            v-model="formData.gender"
            :disabled="isLoading"
          />
          <span class="text-sm text-gray-700">Female</span>
        </label>

        <label class="flex items-center cursor-pointer">
          <input
            type="radio"
            value="diverse"
            class="mr-2"
            v-model="formData.gender"
            :disabled="isLoading"
          />
          <span class="text-sm text-gray-700">Diverse</span>
        </label>
      </div>

      <div class="my-4">
        <label for="forEmail" class="block text-sm mb-2 text-gray-400">Email</label>
        <input
          v-model="formData.email"
          type="email"
          id="forEmail"
          placeholder="Enter e-mail address"
          class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
          aria-describedby="hs-input-helper-text"
          required
          :disabled="isLoading"
          readonly
        />
      </div>

      <div class="mb-4">
        <label for="forPassword" class="block text-sm mb-2 text-gray-400">Password</label>
        <div class="relative">
          <input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            id="forPassword"
            placeholder="Enter Password"
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
          >Repeat Password</label
        >
        <div class="relative">
          <input
            v-model="formData.repeatPassword"
            :type="showRepeatPassword ? 'text' : 'password'"
            id="password_confirmation"
            placeholder="Enter Repeat Password"
            class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
            aria-describedby="hs-input-helper-text"
            required
            :disabled="isLoading"
          />

          <button
            type="button"
            @click="toggleRepeatPasswordVisibility"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <EyeIcon v-if="!showRepeatPassword" />
            <EyeOffIcon v-else />
          </button>
        </div>
      </div>
    </div>

    <div class="grid my-6">
      <button
        type="submit"
        class="btn py-[10px] text-base text-white font-medium hover:bg-blue-700"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
      </button>
    </div>

    <!-- TODO: redirect -->
  </form>
</template>
