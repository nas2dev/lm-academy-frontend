<script setup>
import { useUserStore } from '@/stores/useUserStore'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getProfileImageUrl } from '@/utils/backendHelper'
import * as yup from 'yup'
import { Form, Field, ErrorMessage } from 'vee-validate'

const userStore = useUserStore()
const toast = useToast()
const route = useRoute()
const userProfile = ref({})
const loading = ref(false)
const error = ref(null)
const editForm = ref({})
const loadingForm = ref(false)
const telInputKey = ref(0)

// Determine if this is "my profile" or "other user's profile"
console.log('route', route)

const isMyProfile = computed(() => !route.params.userId)
const userId = computed(() => route.params.userId)

// Convert date string to Date object for vCalendar
const parseDate = (dateString) => {
  if (!dateString) return null
  return new Date(dateString)
}

const getUserProfile = async () => {
  loading.value = true
  error.value = null

  try {
    let response

    if (isMyProfile.value) {
      response = await Axios.get('auth/user-profile')
      userStore.setUser(response.data.user)
    } else {
      response = await Axios.get(`users/${userId.value}/profile`)
    }

    userProfile.value = response.data.user
    editForm.value = {
      first_name: userProfile.value.first_name || '',
      last_name: userProfile.value.last_name || '',
      gender: userProfile.value.gender || '',
      academic_year: userProfile.value.academic_year || '',
      date_of_birth: parseDate(userProfile.value.date_of_birth),
      tel: userProfile.value.user_info?.tel,
      address: userProfile.value.user_info?.address,
      about: userProfile.value.user_info?.about,
    }

    // Force vue-tel-input to re-render with new value
    await nextTick()
    telInputKey.value++
  } catch (error) {
    console.error('Error fetching user profile', error)
    error.value = error.response?.data?.message || 'Failed to fetch user profile'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.userId,
  () => {
    console.log('watch called')

    getUserProfile()
  },
  { immediate: true },
)

const getUserProfileTitle = () => {
  return isMyProfile.value ? 'My Profile' : 'User Profile'
}

const profileSchema = yup.object({
  first_name: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(255, 'First name must be less than 255 characters'),
  last_name: yup.string().required('Last name is required').min(2).max(255),
  gender: yup.string().oneOf(['male', 'female', 'diverse'], 'Invalid gender'),
  academic_year: yup
    .number()
    .typeError('Academic year must be a number!')
    .integer()
    .min(new Date().getFullYear() - 80)
    .max(new Date().getFullYear())
    .nullable(true),
  date_of_birth: yup
    .mixed()
    .test('valid-date', 'Invalid date', (v) => !v || !isNaN(new Date(v).getTime()))
    .test('paste-date', 'Date must be before today', (v) => !v || new Date(v) < new Date()),
  tel: yup.string().max(30),
  address: yup.string().max(255),
  about: yup.string().max(1000),
})

// Academic year options
const academicYearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 10; i++) {
    years.push(currentYear - i)
  }

  return years
})

const formatDisplayDate = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d)) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}

const onSubmit = async () => {
  await saveProfile()
}

const saveProfile = async () => {
  try {
    loadingForm.value = true
    const profileDate = {
      ...editForm.value,
      date_of_birth: formatDateForBackend(editForm.value.date_of_birth),
    }

    const response = await Axios.put(`/users/update-profile`, profileDate)

    if (response.data.success) {
      userProfile.value = response.data.user
      userStore.setUser(response.data.user)
      toast.success('Profile updated successfully')
    }
  } catch (error) {
    console.error('Error saving profile', error)
    const errorObj = error.response?.data?.errors
    if (errorObj && typeof errorObj === 'object') {
      // Instead of joining all field messages, iterate and show each individually
      let hasErrors = false
      for (const field in errorObj) {
        if (Array.isArray(errorObj[field])) {
          errorObj[field].forEach((msg) => {
            toast.error(msg)
            hasErrors = true
          })
        } else if (errorObj[field]) {
          toast.error(errorObj[field])
          hasErrors = true
        }
      }
      error.value = hasErrors
        ? 'Please review the highlighted errors above.'
        : 'Failed to save profile'
    } else {
      error.value = 'Failed to save profile'
      toast.error(error.value)
    }
  } finally {
    loadingForm.value = false
  }
}

const formatDateForBackend = (date) => {
  if (!date) return null

  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear() // 2025
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const uploadInputRef = ref(null)
const imageUploading = ref(false)
const imageDeleting = ref(false)

const triggerFilePicker = () => {
  if (imageUploading.value) return
  uploadInputRef.value.click()
}

const handleImageSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  await uploadProfileImage(file)
  event.target.value = ''
}

const uploadProfileImage = async (file) => {
  imageUploading.value = true
  try {
    const formData = new FormData()
    formData.append('profile_image', file)

    const response = await Axios.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.success) {
      userProfile.value.image = response.data.user.image
      userStore.setUser(response.data.user)
      toast.success('Profile picture uploaded successfully')
    }
  } catch (error) {
    console.error('Error uploading profile image', error)
    toast.error('Failed to upload profile image')
  } finally {
    imageUploading.value = false
  }
}

const deleteProfileImage = async () => {
  if (!userProfile.value.image || imageDeleting.value) return
  imageDeleting.value = true
  try {
    const response = await Axios.delete('/users/profile/image')
    if (response.data.success) {
      userProfile.value.image = null
      userStore.setUser(response.data.user)
      toast.success('Profile picture deleted successfully')
    }
  } catch (error) {
    console.error('Error deleting profile image', error)
    toast.error('Failed to delete profile image')
  } finally {
    imageDeleting.value = false
  }
}
</script>

<template>
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-semibold">{{ getUserProfileTitle() }}</h2>
  </div>

  <div>
    <router-link
      v-if="isMyProfile"
      :to="{ name: 'ChangePasswordPage' }"
      class="flex justify-end text-sm hover:text-blue-600 mr-3 mb-1 text-authBlue font-semibold"
      >Change password
    </router-link>
    <div class="card">
      <div class="card-body">
        <div v-if="loading">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-red-500 text-center py-12">
          {{ error }}
        </div>

        <!-- Profile Content -->
        <div v-else>
          <Form :validation-schema="profileSchema" v-slot="{ handleSubmit }">
            <form
              @submit.prevent="handleSubmit(onSubmit)"
              class="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <!-- Left Column: Image + First/Last name + Email -->
              <div class="lg:col-span-1">
                <div class="rounded-t-lg rounded-b-lg border border-gray-200">
                  <img
                    :src="getProfileImageUrl(userProfile.image)"
                    :alt="userProfile.first_name"
                    class="w-full aspect-[4/5] max-h-[22em] object-cover rounded-t-lg"
                  />

                  <hr class="border-gray-200" />

                  <div v-if="isMyProfile" class="space-y-4 px-3 py-4">
                    <!-- First name -->
                    <div>
                      <label for="firstName" class="block text-sm font-semibold text-gray-700 mb-1"
                        >First Name</label
                      >
                      <Field
                        v-if="isMyProfile"
                        as="input"
                        v-model="editForm.first_name"
                        name="first_name"
                        type="text"
                        id="firstName"
                        :disabled="loading || loadingForm"
                        class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                      />
                      <p v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        {{ userProfile.first_name || 'N/A' }}
                      </p>
                      <ErrorMessage name="first_name" class="text-red-500 text-sm" />
                    </div>

                    <!-- Last name -->
                    <div>
                      <label for="lastName" class="block text-sm font-semibold text-gray-700 mb-1"
                        >Last Name</label
                      >
                      <Field
                        v-if="isMyProfile"
                        as="input"
                        v-model="editForm.last_name"
                        name="last_name"
                        type="text"
                        id="lastName"
                        :disabled="loading || loadingForm"
                        class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                      />
                      <p v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        {{ userProfile.last_name || 'N/A' }}
                      </p>
                      <ErrorMessage name="last_name" class="text-red-500 text-sm mt-1" />
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      ref="uploadInputRef"
                      @change="handleImageSelected"
                    />

                    <!-- Upload/delete Profile Image btns -->
                    <div v-if="isMyProfile" class="flex items-center gap-3 mb-4">
                      <button
                        @click="triggerFilePicker"
                        :disabled="imageUploading"
                        type="button"
                        class="text-sm flex-1 inline-flex items-center justify-center h-12 px-6 rounded-full bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60"
                      >
                        {{ imageUploading ? 'Uploading...' : 'Upload Pic' }}
                      </button>
                      <button
                        type="button"
                        class="text-sm flex-1 inline-flex items-center justify-center h-12 px-6 rounded-full border-2 border-orange-300 text-orange-400 font-semibold hover:bg-orange-50 hover:border-orange-400 hover:text-orange-500 disabled:opacity-50"
                        @click="deleteProfileImage"
                        :disabled="imageDeleting"
                      >
                        {{ imageDeleting ? 'Deleting...' : 'Delete Pic' }}
                      </button>
                    </div>
                  </div>
                  <p v-else class="text-lg text-gray-500 px-3 py-4">
                    {{ userProfile.first_name }} {{ userProfile.last_name }}
                  </p>
                </div>
                <p class="text-sm text-center text-gray-500 px-3 py-4">
                  {{ userProfile.email || 'N/A' }}
                </p>
              </div>

              <!-- Right Column: All other fields -->
              <div class="lg:col-span-2 space-y-4">
                <!-- Academic Year -->
                <div>
                  <label for="academicYear" class="block text-sm font-medium text-gray-700 mb-2"
                    >Academic Year</label
                  >
                  <Field
                    v-if="isMyProfile"
                    as="select"
                    :disable="loading || loadingForm"
                    v-model="editForm.academic_year"
                    type="text"
                    name="academic_year"
                    class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0 cursor-pointer"
                  >
                    <option value="">Select Year</option>
                    <option v-for="year in academicYearOptions" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </Field>
                  <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    {{ userProfile.academic_year || 'N/A' }}
                  </div>
                  <ErrorMessage name="academic_year" class="text-red-500 text-sm mt-1" />
                </div>

                <!-- Gender -->
                <div>
                  <label for="gender" class="block text-sm font-medium text-gray-700 mb-2"
                    >Gender</label
                  >
                  <Field
                    v-if="isMyProfile"
                    as="select"
                    :disable="loading || loadingForm"
                    v-model="editForm.gender"
                    type="text"
                    name="gender"
                    class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0 cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="diverse">Diverse</option>
                  </Field>
                  <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    {{ userProfile.gender || 'N/A' }}
                  </div>
                  <ErrorMessage name="gender" class="text-red-500 text-sm mt-1" />
                </div>

                <!-- Birthday -->
                <div>
                  <label for="birthday" class="block text-sm font-medium text-gray-700 mb-2"
                    >Birthday</label
                  >
                  <div v-if="isMyProfile" class="flex justify-left">
                    <Field name="date_of_birth" v-slot="{ field }">
                      <VDatePicker
                        v-model="editForm.date_of_birth"
                        mode="date"
                        :max-date="new Date()"
                        :is-required="false"
                        :disabled="loading || loadingForm"
                        is-expanded
                        trim-weeks
                        @update:modelValue="field.onChange"
                      />
                    </Field>
                    <ErrorMessage name="date_of_birth" class="text-red-500 text-sm mt-1" />
                  </div>
                  <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    {{ formatDisplayDate(userProfile.date_of_birth) || 'N/A' }}
                  </div>
                </div>

                <!-- Tel -->
                <div>
                  <label for="Tel" class="block text-sm font-medium text-gray-700 mb-2">Tel</label>
                  <div v-if="isMyProfile">
                    <Field name="tel" v-slot="{ field }">
                      <vue-tel-input
                        :key="telInputKey"
                        v-model="editForm.tel"
                        :disable="loading || loadingForm"
                        class="w-full"
                        name="tel"
                        @input="field.onChange"
                      />
                    </Field>
                    <ErrorMessage name="tel" class="text-red-500 text-sm mt-1" />
                  </div>
                  <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    {{ userProfile.user_info?.tel || 'N/A' }}
                  </div>
                </div>

                <!-- Address -->
                <div>
                  <label for="address" class="block text-sm font-medium text-gray-700 mb-2"
                    >Address</label
                  >
                  <Field
                    v-if="isMyProfile"
                    as="input"
                    :disable="loading || loadingForm"
                    v-model="editForm.address"
                    type="text"
                    name="address"
                    class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                  />
                  <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    {{ userProfile.user_info?.address || 'N/A' }}
                  </div>
                  <ErrorMessage name="address" class="text-red-500 text-sm mt-1" />
                </div>

                <!-- About -->
                <div>
                  <label for="about" class="block text-sm font-medium text-gray-700 mb-2"
                    >About</label
                  >
                  <Field
                    v-if="isMyProfile"
                    as="textarea"
                    placeholder="Tell us about yourself..."
                    rows="4"
                    :disable="loading || loadingForm"
                    v-model="editForm.about"
                    type="text"
                    name="about"
                    class="w-full min-h-[10em] py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                  />
                  <div
                    v-else
                    class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[10em]"
                  >
                    {{ userProfile.user_info?.about || 'N/A' }}
                  </div>
                  <ErrorMessage name="about" class="text-red-500 text-sm mt-1" />
                </div>

                <!-- Submit Btn -->
                <div v-if="isMyProfile" class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="loadingForm"
                    class="px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {{ loadingForm ? 'Updating...' : 'Update Profile' }}
                  </button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>
