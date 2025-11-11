<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import EyeIcon from '@/assets/fonts/feather-icons/icons/eye.svg?component'
import EyeOffIcon from '@/assets/fonts/feather-icons/icons/eye-off.svg?component'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'

const loading = ref(false)
const toast = useToast()
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showNewPasswordConfirmation = ref(false)

const toggleVisibility = (field) => {
  if (field === 'old') showOldPassword.value = !showOldPassword.value
  if (field === 'new') showNewPassword.value = !showNewPassword.value
  if (field === 'confirm') showNewPasswordConfirmation.value = !showNewPasswordConfirmation.value
}

const initialValues = {
  old_password: '',
  new_password: '',
  new_password_confirmation: '',
}

const changePasswordSchema = yup.object({
  old_password: yup.string().required('Old password is required'),
  new_password: yup
    .string()
    .required('New password is required')
    .min(8, 'New password must be at least 8 characters long'),
  new_password_confirmation: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('new_password')], 'New password and confirmation password do not match.'),
})

const onSubmit = async (values, { resetForm }) => {
  if (loading.value) return

  const payload = {
    old_password: values.old_password,
    new_password: values.new_password,
    new_password_confirmation: values.new_password_confirmation,
  }

  loading.value = true
  try {
    const response = await Axios.post('/users/change-password', payload)

    if (response.data?.success) {
      toast.success('Password changed successfully')
      showOldPassword.value = false
      showNewPassword.value = false
      showNewPasswordConfirmation.value = false
      resetForm({ values: { ...initialValues } })
    } else {
      const message = extractErrorMessage(response.data)
      toast.error(message)
    }
  } catch (error) {
    console.error('error', error)
    const message = extractErrorMessage(error.response?.data)
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const extractErrorMessage = (data) => {
  if (!data) return null
  if (data.errors) {
    const fieldErrors = Object.values(data.errors).flat()
    if (fieldErrors.length > 0) {
      if (fieldErrors.length) return fieldErrors[0]
    }
  }

  return data.message || null
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <Form
        v-slot="{ handleSubmit }"
        :initial-values="initialValues"
        :validation-schema="changePasswordSchema"
      >
        <form @submit.prevent="handleSubmit(onSubmit)" class="space-y-6 max-w-xl mx-auto">
          <div class="space-y-2">
            <label class="text-sm text-black">Old password</label>
            <div class="relative">
              <Field name="old_password" v-slot="{ field }">
                <input
                  :type="showOldPassword ? 'text' : 'password'"
                  v-bind="field"
                  placeholder="Old password"
                  class="w-full h-11 border border-gray-200 rounded-md px-4 pr-12 text-sm focus:border-blue-600 focus:ring-0"
                  :disabled="loading"
                />
              </Field>
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                @click="toggleVisibility('old')"
              >
                <EyeIcon class="text-black" v-if="!showOldPassword" />
                <EyeOffIcon class="text-black" v-else />
              </button>
            </div>
            <ErrorMessage name="old_password" class="text-red-500 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-black">New password</label>
            <div class="relative">
              <Field name="new_password" v-slot="{ field }">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  v-bind="field"
                  placeholder="New password"
                  class="w-full h-11 border border-gray-200 rounded-md px-4 pr-12 text-sm focus:border-blue-600 focus:ring-0"
                  :disabled="loading"
                />
              </Field>
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                @click="toggleVisibility('new')"
              >
                <EyeIcon class="text-black" v-if="!showNewPassword" />
                <EyeOffIcon class="text-black" v-else />
              </button>
            </div>
            <ErrorMessage name="new_password" class="text-red-500 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-black">Confirm new password</label>
            <div class="relative">
              <Field name="new_password_confirmation" v-slot="{ field }">
                <input
                  :type="showNewPasswordConfirmation ? 'text' : 'password'"
                  v-bind="field"
                  placeholder="Confirm password"
                  class="w-full h-11 border border-gray-200 rounded-md px-4 pr-12 text-sm focus:border-blue-600 focus:ring-0"
                  :disabled="loading"
                />
              </Field>
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                @click="toggleVisibility('confirm')"
              >
                <EyeIcon class="text-black" v-if="!showNewPasswordConfirmation" />
                <EyeOffIcon class="text-black" v-else />
              </button>
            </div>
            <ErrorMessage name="new_password_confirmation" class="text-red-500 text-sm" />
          </div>
          <button
            :disabled="loading"
            type="submit"
            class="w-1/2 flex justify-center items-center mx-auto h-11 rounded-full border-2 border-blue-400 text-blue-500 font-semibold transition-colors hover:bg-blue-50 disabled:opacity-60"
          >
            {{ loading ? 'Changing...' : 'Change' }}
          </button>
        </form>
      </Form>
    </div>
  </div>
</template>
