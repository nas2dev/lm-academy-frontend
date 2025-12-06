<script setup>
import { ref, onMounted } from 'vue'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import SearchEyeIcon from '@/assets/images/search-eye-line.png'

const toast = useToast()

// state
const users = ref([])
const courses = ref([])
const courseStats = ref([])
const loading = ref(false)
const error = ref(null)
const loadingUsers = ref(false)
const loadingCourses = ref(false)
const progressMessage = ref('')

// Selected filters
const selectedUserId = ref('all')
const selectedCourseId = ref('all')

// Fetch active users for dropdown
const fetchActiveUsers = async () => {
  loadingUsers.value = true
  try {
    const response = await Axios.get('/users/active-users-for-dropdown')

    if (response.data.success) {
      users.value = response.data.users.map((user) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      }))
    } else {
      throw new Error(response.data.message || 'Failed to fetch users')
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch users'
    toast.error(error.value)
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

// Fetch active courses for dropdown
const fetchActiveCourses = async () => {
  loadingCourses.value = true
  try {
    const response = await Axios.get('/courses/dropdown/active-courses-for-dropdown')

    if (response.data.success) {
      courses.value = response.data.courses.map((course) => ({
        id: course.id,
        title: course.title,
      }))
    } else {
      throw new Error(response.data.message || 'Failed to fetch courses')
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch courses'
    toast.error(error.value)
    courses.value = []
  } finally {
    loadingCourses.value = false
  }
}

onMounted(() => {
  fetchActiveUsers()
  fetchActiveCourses()
})

// Fetch course progress
const fetchCourseProgress = async () => {
  if (loading.value) return

  loading.value = true
  error.value = null
  progressMessage.value = ''

  try {
    const params = new URLSearchParams({
      user_id: selectedUserId.value,
      course_id: selectedCourseId.value,
    })

    const response = await Axios.get(`/course-progress?${params.toString()}`)

    if (response.data.success) {
      courseStats.value = response.data.data.map((progress, index) => ({
        id: progress.id,
        nr: index + 1,
        user_name: `${progress.user?.first_name || ''} ${progress.user?.last_name || ''}`.trim(),
        user_email: progress.user?.email,
        course_name: progress.course?.title,
        progress: progress.completion_percentage || 0,
        status: progress.completion_status,
        started_date: progress.started_date,
        pending_sections: progress.pending_sections,
        pending_modules: progress.pending_modules,
      }))

      progressMessage.value = response.data.progressMessage || ''

      if (progressMessage.value) {
        toast.info(progressMessage.value)
      } else if (courseStats.value.length > 0) {
        toast.success(`Found ${courseStats.value.length} progress record(s)`)
      }
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch course progress'
    toast.error(error.value)
    courseStats.value = []
  } finally {
    loading.value = false
  }
}

// Get status badge color
const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-[#DFFFF3] text-[#4BD08B]'
    case 'Close':
      return 'bg-[#FFEDE9] text-[#FB977D]'
    case 'Progressing':
      return 'bg-[#FFF6EA] text-[#F8C076]'
    case 'Started':
      return 'bg-[#E5F3FB] text-[#0085DB]'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get progress circle color based on status
const getProgressCircleColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#1A932E'
    case 'Close':
      return '#FB977D'
    case 'Progressing':
      return '#E5AE21'
    case 'Started':
      return '#459DBF'
    default:
      return '#459DBF'
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Course Stats</h2>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <!-- Combined Filter and Table Section -->
    <div class="w-full bg-white shadow-xl p-4 rounded-2xl">
      <!-- Filters Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-4">
        <!-- Users Dropdown -->
        <div>
          <label for="user-select" class="block text-lg font-medium text-gray-700 mb-2"
            >Users</label
          >
          <div class="relative">
            <select
              id="user-select"
              v-model="selectedUserId"
              :disabled="loadingUsers"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All Users</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
            <div v-if="loadingUsers" class="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>

        <!-- Courses Dropdown -->
        <div>
          <label for="course-select" class="block text-lg font-medium text-gray-700 mb-2"
            >Courses</label
          >
          <div class="relative">
            <select
              id="course-select"
              v-model="selectedCourseId"
              :disabled="loadingCourses"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All Courses</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
            <div v-if="loadingCourses" class="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Check Button -->
      <div class="flex justify-center mb-8">
        <button
          type="button"
          @click="fetchCourseProgress"
          :disabled="loading || loadingUsers || loadingCourses"
          class="px-36 py-2 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-3"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Check</span>
          <img v-if="!loading" :src="SearchEyeIcon" alt="Search" class="w-8 h-8" />
        </button>
      </div>

      <!-- Progress Message -->
      <div
        v-if="progressMessage && !error"
        class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md"
      >
        <p class="text-sm text-blue-800">{{ progressMessage }}</p>
      </div>

      <!-- Training Progress Table -->
      <div v-if="!loading && courseStats.length > 0 && !progressMessage">
        <div><h5 class="text-xl font-bold py-4">Training Progress</h5></div>
      </div>

      <!-- Table -->
      <table
        v-if="!progressMessage && courseStats.length > 0"
        class="w-full text-sm text-left rtl:text-right text-gray-500"
      >
        <thead class="text-xm text-gray-700 uppercase rounded-lg border-b-[1px] border-gray">
          <tr>
            <th scope="col" class="px-6 py-3">Nr</th>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">E-mail</th>
            <th scope="col" class="px-6 py-3">Course</th>
            <th scope="col" class="px-6 py-3 text-center">Started</th>
            <th scope="col" class="px-6 py-3 text-center">Uc S</th>
            <th scope="col" class="px-6 py-3 text-center">Uc M</th>
            <th scope="col" class="px-6 py-3 text-center">Status</th>
            <th scope="col" class="px-6 py-3 text-center">Progress</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(stat, index) in courseStats"
            :key="stat.id"
            :class="['text-black', { 'border-b': index !== courseStats.length - 1 }]"
          >
            <td class="px-6 py-4">{{ stat.nr }}</td>
            <td class="px-6 py-4">{{ stat.user_name }}</td>
            <td class="px-6 py-4">{{ stat.user_email }}</td>
            <td class="px-6 py-4">{{ stat.course_name }}</td>
            <td class="px-6 py-4 text-center">{{ stat.started_date }}</td>
            <td class="px-6 py-4 text-center">{{ stat.pending_sections }}</td>
            <td class="px-6 py-4 text-center">{{ stat.pending_modules }}</td>
            <td class="px-6 py-4 text-center">
              <span
                class="inline-block w-32 py-3 rounded-full text-sm font-semibold whitespace-nowrap text-center"
                :class="getStatusColor(stat.status)"
                >{{ stat.status }}</span
              >
            </td>
            <td class="px-6 py-4 text-center">
              <div
                class="relative w-16 h-16 flex items-center font-semibold justify-center text-gray-700 rounded-full p-6 mx-auto"
                :style="{
                  background: `conic-gradient(
                    ${getProgressCircleColor(stat.status)} ${stat.progress * 3.6}deg,
                    #e5e7eb 0deg
                    )`,
                }"
              >
                <!-- Inner white circle to create border effect -->
                <div
                  class="absolute inset-0 m-1.5 rounded-full bg-white flex items-center justify-center"
                >
                  <span class="text-[13px]">{{ stat.progress }}%</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
        ></div>
        <p class="mt-2 text-sm text-gray-500">Loading progress data...</p>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && courseStats.length === 0 && !error && !progressMessage"
        class="text-center py-8"
      >
        <div class="text-gray-400 mb-2">
          <svg
            class="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p class="text-gray-500 font-medium">No data to display</p>
        <p class="text-gray-400 text-sm mt-1">
          Select filters and click "Check" button to view course progress.
        </p>
      </div>
    </div>
  </div>
</template>
