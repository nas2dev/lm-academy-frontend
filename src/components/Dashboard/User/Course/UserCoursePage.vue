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
      per_page: perPage.value,
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

const getPageNumbers = () => {
  if (!pagination.value) return []

  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const pages = []

  if (last <= 7) {
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(last - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < last - 3) pages.push('...')
    pages.push(last)
  }

  return pages
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchCourses()
}

const handlePerPageChange = () => {
  currentPage.value = 1
  fetchCourses()
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

const truncateDescription = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDuration = (minutes) => {
  if (!minutes) return '00:00'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:00`
}

const getStatusClass = (status) => {
  switch (status) {
    case 'new':
      return 'text-blue-500'
    case 'progressing':
      return 'text-orange-500'
    case 'completed':
      return 'text-green-500'
    default:
      return 'text-gray-500'
  }
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
            @click="$router.push({ name: 'UserCourseDetailPage', params: { courseId: course.id } })"
          >
            <!-- Course Image/Logo Area (Left) -->
            <div class="w-1/5 flex-shrink-0">
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
            <!-- Course Content -->
            <div class="w-4/5 flex flex-col justify-between items-start gap-4">
              <!-- Course Title -->
              <h5 class="font-bold text-gray-800 text-lg">{{ course.title }}</h5>

              <!-- Course Description -->
              <p class="text-gray-400 text-sm text-justify">
                {{ truncateDescription(course.description, 400) }}
              </p>

              <!-- Course Details -->
              <div>
                <p class="text-gray-400 text-sm text-justify">
                  {{ formatDuration(course.duration) }} Minutes - {{ course.files }} Files
                </p>

                <!-- Status Badge -->
                <p
                  v-if="course.user_progress"
                  :class="['font-semibold text-sm mt-1', getStatusClass(course.user_progress)]"
                >
                  {{ course.status_label }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500 text-lg">No course found</p>
        </div>

        <!-- Pagination (from DataTable) -->
        <div
          v-if="!loading && !error && pagination && pagination.last_page > 0"
          class="flex items-center justify-between mt-6"
        >
          <div class="flex items-center space-x-4">
            <span>
              <span>{{ pagination.from || 0 }}</span
              ><span> from </span><span>{{ pagination.total || 0 }}</span>
            </span>

            <select
              v-model="perPage"
              @change="
                (e) => {
                  perPage = parseInt(e.target.value)
                  handlePerPageChange()
                }
              "
              class="px-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent per-page-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Previous Page Button -->
            <button
              @click="handlePageChange(pagination.current_page - 1)"
              :disabled="!pagination.prev_page_url"
              class="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed pagination-nav"
            >
              Previous
            </button>

            <template v-for="page in getPageNumbers()" :key="page">
              <button
                v-if="page !== '...'"
                @click="handlePageChange(page)"
                :class="[
                  'w-8 h-8 text-sm font-medium rounded-full flex items-center justify-center',
                  page === pagination.current_page
                    ? 'bg-[#46C9EA] text-white shadow-md'
                    : 'text-[#46C9EA] bg-white border border-[#46C9EA] shadow-md hover:bg-[#46C9EA] hover:text-white',
                ]"
              >
                {{ page }}
              </button>
              <span v-else>...</span>
            </template>

            <!-- Next Page Button -->
            <button
              @click="handlePageChange(pagination.current_page + 1)"
              :disabled="!pagination.next_page_url"
              class="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed pagination-nav"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.per-page-select {
  padding-right: 1.7rem;
  text-align: center;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

.per-page-select:open {
  text-align: left;
}

.pagination-nav {
  background: none;
  border: none;
  padding: 0;
}
</style>
