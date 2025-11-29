<script setup>
import { ref, onMounted } from 'vue'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import { getStorageUrl } from '@/utils/backendHelper'

const toast = useToast()
const courses = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref(null)

const searchTerm = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const fetchCourses = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      perPage: perPage.value,
    })

    if (searchTerm.value) {
      params.append('searchTerm', searchTerm.value)
    }

    const { data } = await Axios.get(`/courses/user/active?${params.toString()}`)

    if (!data.success) {
      throw new Error(data?.message || 'Failed to fetch courses')
    }

    courses.value = data.courses.data

    pagination.value = {
      current_page: data.courses.current_page,
      per_page: data.courses.per_page,
      total: data.courses.total,
      last_page: data.courses.last_page,
      from: data.courses.from,
      to: data.courses.to,
      prev_page_url: data.courses.prev_page_url,
      next_page_url: data.courses.next_page_url,
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch courses'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const getThumbnailUrl = (thumbnail) => {
  return thumbnail ? getStorageUrl(thumbnail, null) : null
}

onMounted(() => {
  fetchCourses()
})

// Debounce search
let searchTimeout = null
const handleSearchInput = (value) => {
  searchTerm.value = value
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchCourses()
  }, 500) // 500ms debounce
}
</script>
<template>
  <div class="space-y-6">
    <!-- Main Title -->
    <h2 class="text-2xl font-semibold text-gray-800">Courses</h2>

    <!-- Card Container -->
    <div class="card">
      <div class="card-body">
        <!-- Header with Subtitle and Search bar -->
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-lg font-semibold text-gray-800">
            Discover our {{ pagination?.total || 0 }} available courses
          </h3>

          <!-- Search bar -->
          <div class="relative">
            <input
              type="text"
              :value="searchTerm"
              placeholder="Search..."
              @input="handleSearchInput($event.target.value)"
              class="w-64 px-4 py-2 pl-10 pr-4 text-sm bg-white border border-gray-300 shadow rounded-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center py-8">
          <div class="text-red-500 mb-2">
            {{ error }}
          </div>
          <button
            type="button"
            @click="fetchCourses()"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>

        <!-- Course Cards (Vertical Stack) -->
        <div v-else-if="courses.length > 0" class="space-y-0">
          <div
            v-for="course in courses"
            :key="course.id"
            class="w-full flex items-start justify-start gap-4 h-full p-4 bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <!-- Course Image/Logo Area (Left) -->
            <img
              v-if="course.thumbnail"
              :src="getThumbnailUrl(course.thumbnail)"
              :alt="course.title"
              loading="lazy"
              class="w-full h-[200px] bg-gray-100 flex items-center justify-center rounded-lg shadow-md"
            />
            <div
              v-else
              class="w-full h-[200px] bg-gray-100 flex items-center justify-center rounded-lg shadow-md"
            >
              <span class="text-gray-400 text-4xl font-bold">{{ course.title.charAt(0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
