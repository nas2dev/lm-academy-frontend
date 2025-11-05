<script setup>
import { useUserStore } from '@/stores/useUserStore'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProfileImageUrl } from '@/utils/backendHelper'

const userStore = useUserStore()
const toast = useToast()
const route = useRoute()
const userProfile = ref({})
const loading = ref(false)
const error = ref(null)

// Determine if this is "my profile" or "other user's profile"
console.log('route', route)

const isMyProfile = computed(() => !route.params.userId)
const userId = computed(() => route.params.userId)

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
</script>

<template>
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-semibold">{{ getUserProfileTitle() }}</h2>
  </div>

  <div>
    <router-link
      v-if="isMyProfile"
      :to="{ name: 'UserProfilePage' }"
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
          <form class="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <input
                      v-if="isMyProfile"
                      v-model="userProfile.first_name"
                      type="text"
                      id="firstName"
                      :disabled="loading"
                      class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                      readonly
                    />
                    <p v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      {{ userProfile.first_name || 'N/A' }}
                    </p>
                  </div>

                  <!-- Last name -->
                  <div>
                    <label for="lastName" class="block text-sm font-semibold text-gray-700 mb-1"
                      >Last Name</label
                    >
                    <input
                      v-if="isMyProfile"
                      v-model="userProfile.last_name"
                      type="text"
                      id="lastName"
                      :disabled="loading"
                      class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                      readonly
                    />
                    <p v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      {{ userProfile.last_name || 'N/A' }}
                    </p>
                  </div>

                  <input type="file" accept="image/*" class="hidden" ref="uploadInputRef" />

                  <!-- Upload/delete Profile Image btns -->
                  <div v-if="isMyProfile" class="flex items-center gap-3 mb-4">
                    <button
                      type="button"
                      class="text-sm flex-1 inline-flex items-center justify-center h-12 px-6 rounded-full bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60"
                    >
                      Upload Pic
                    </button>
                    <button
                      type="button"
                      class="text-sm flex-1 inline-flex items-center justify-center h-12 px-6 rounded-full border-2 border-orange-300 text-orange-400 font-semibold hover:bg-orange-50 hover:border-orange-400 hover:text-orange-500 disabled:opacity-50"
                    >
                      Delete Pic
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
                <input
                  v-if="isMyProfile"
                  :disable="loading"
                  type="text"
                  name="academicYear"
                  class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                />
                <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  {{ userProfile.academic_year || 'N/A' }}
                </div>
              </div>

              <!-- Gender -->
              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700 mb-2"
                  >Gender</label
                >
                <input
                  v-if="isMyProfile"
                  :disable="loading"
                  type="text"
                  name="gender"
                  class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                />
                <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  {{ userProfile.gender || 'N/A' }}
                </div>
              </div>

              <!-- Birthday -->
              <div>
                <label for="birthday" class="block text-sm font-medium text-gray-700 mb-2"
                  >Birthday</label
                >
                <input
                  v-if="isMyProfile"
                  :disable="loading"
                  type="text"
                  name="birthday"
                  class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                />
                <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  {{ userProfile.date_of_birth || 'N/A' }}
                </div>
              </div>

              <!-- Tel -->
              <div>
                <label for="Tel" class="block text-sm font-medium text-gray-700 mb-2">Tel</label>
                <input
                  v-if="isMyProfile"
                  :disable="loading"
                  type="text"
                  name="Tel"
                  class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                />
                <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  {{ userProfile.user_info?.tel || 'N/A' }}
                </div>
              </div>

              <!-- Address -->
              <div>
                <label for="address" class="block text-sm font-medium text-gray-700 mb-2"
                  >Address</label
                >
                <input
                  v-if="isMyProfile"
                  :disable="loading"
                  type="text"
                  name="address"
                  class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                />
                <div v-else class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  {{ userProfile.user_info?.address || 'N/A' }}
                </div>
              </div>

              <!-- About -->
              <div>
                <label for="about" class="block text-sm font-medium text-gray-700 mb-2"
                  >About</label
                >
                <input
                  v-if="isMyProfile"
                  :disable="loading"
                  type="text"
                  name="about"
                  class="w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0"
                />
                <div
                  v-else
                  class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[10em]"
                >
                  {{ userProfile.user_info?.about || 'N/A' }}
                </div>
              </div>

              <!-- Submit Btn -->
              <div v-if="isMyProfile" class="flex justify-end">
                <button
                  type="submit"
                  class="px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
