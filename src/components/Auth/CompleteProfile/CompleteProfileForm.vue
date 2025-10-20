<script setup lang="ts">
import { computed, ref } from 'vue'
import AuthRedirect from '../General/AuthRedirect.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isLoading = ref(false)

// formData
const formData = ref({
  academicYear: new Date().getFullYear(),
  address: '',
  telephone: '',
  birthday: null,
  about: '',
})

const profileImage = ref(null)
const profileImagePreview = ref(null)

const currentYear = new Date().getFullYear()
const academicYearOptions = computed(() => {
  const years = []

  for (let i = 0; i < 10; i++) {
    years.push(currentYear - i)
  }
  return years
})

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    profileImage.value = file

    // create a preview
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImagePreview.value = e.target.result
    }

    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <form>
    <div class="mb-4">
      <label for="academicYear" class="block text-sm mb-2 text-gray-400">Academic Year</label>
      <select
        v-model="formData.academicYear"
        id="academicYear"
        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
        required
        :disabled="isLoading"
      >
        <option v-for="year in academicYearOptions" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>

    <div class="mb-4">
      <label for="address" class="block text-sm mb-2 text-gray-400">Address</label>
      <input
        v-model="formData.address"
        type="text"
        id="address"
        placeholder="Enter your address"
        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
        aria-describedby="hs-input-helper-text"
        required
        :disabled="isLoading"
      />
    </div>

    <div class="mb-4">
      <label for="telephone" class="block text-sm mb-2 text-gray-400">Telephone</label>
      <input
        v-model="formData.telephone"
        type="tel"
        id="telephone"
        placeholder="Enter your telephone number"
        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
        aria-describedby="hs-input-helper-text"
        required
        :disabled="isLoading"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm mb-2 text-gray-400">Birthday</label>
      <div class="flex justify-left">
        <VDatePicker
          v-model="formData.birthday"
          mode="date"
          :max-date="new Date()"
          :is-required="true"
          is-expanded
          trim-weeks
        />
      </div>

      <!-- profile image section -->
      <div class="my-4 text-center">
        <div class="relative inline-block">
          <div
            class="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg"
          >
            <img
              v-if="profileImagePreview"
              :src="profileImagePreview"
              alt="Profile Image"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
              <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- upload/remove buttons -->
      <div class="flex justify-center gap-4">
        <label
          for="profileImage"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:outline-none focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Upload
        </label>

        <button
          type="button"
          class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Remove
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        id="profileImage"
        class="hidden"
        @change="handleImageSelect"
      />
      <p class="text-xs text-gray-500 mt-2">Only JPG, JPEG, PNG files are allowed (max. 5MB)</p>
    </div>

    <div class="mb-6">
      <label for="about" class="block text-sm mb-2 text-gray-400">About</label>
      <textarea
        v-model="formData.about"
        id="about"
        rows="4"
        placeholder="Tell us about yourself..."
        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
      ></textarea>
    </div>

    <div class="grid my-6">
      <button
        type="submit"
        class="btn py-[10px] text-base text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Complete Profile
      </button>
    </div>

    <AuthRedirect page-title="Sign Out" :is-logout="true" />
  </form>
</template>
