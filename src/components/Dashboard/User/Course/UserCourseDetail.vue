<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import { getStorageUrl } from '@/utils/backendHelper'
import folderLineIcon from '@/assets/images/folder-line.png'
import foldersLineIcon from '@/assets/images/folders-line.png'
import FileLineIcon from '@/assets/images/file-line.png'
import movieLineIcon from '@/assets/images/movie-line.png'

const route = useRoute()
const toast = useToast()

const course = ref(null)
const loading = ref(false)
const error = ref(null)
const totalModules = ref(0)
const totalSections = ref(0)
const totalUsersEnrolled = ref(0)
const courseStatus = ref('new')

const expandedModules = ref([])

const courseId = computed(() => route.params.courseId)

const fetchCourseDetails = async () => {
  loading.value = true
  error.value = null

  try {
    const { data } = await Axios.get(`/courses/user/${courseId.value}`)

    if (!data.success) {
      throw new Error(data?.message || 'Failed to fetch course details')
    }

    course.value = data.course
    totalModules.value = data.totalModules
    totalSections.value = data.totalSections
    totalUsersEnrolled.value = data.totalUsersEnrolled
    courseStatus.value = data.courseStatus

    // Initialize accordion state (all collapsed)
    expandedModules.value = Array(course.value.modules.length).fill(false)
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch course details'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourseDetails()
})

const getVideoUrl = () => {
  return course.value?.intro_video ? getStorageUrl(course.value.intro_video, null) : null
}

const getThumbnailUrl = () => {
  return course.value?.thumbnail ? getStorageUrl(course.value.thumbnail, null) : null
}

const formatDate = (dateString) => {
  if (!dateString) return 'No recent updates'
  const date = new Date(dateString)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${year}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Main Title -->
    <h2 class="text-2xl font-semibold text-gray-800">Course</h2>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 mb-2">{{ error }}</div>
      <button
        @click="fetchCourseDetails"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>

    <!-- Course Content -->
    <div v-else-if="course" class="card">
      <!-- Course Banner (Video/image) -->
      <div class="p-4">
        <div
          class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex items-center justify-center"
        >
          <video
            v-if="getVideoUrl()"
            :src="getVideoUrl()"
            class="max-h-[350px] w-full object-contain rounded-lg"
            controls
            muted
            autoplay
            loop
          ></video>
          <img
            v-else-if="getThumbnailUrl()"
            :src="getThumbnailUrl()"
            class="max-h-[350px] w-full object-contain rounded-lg"
            alt="Course Thumbnail"
          />
          <div
            v-else
            class="w-full h-[350px] bg-gray-100 flex items-center justify-center rounded-lg"
          >
            <span class="text-gray-400 text-6xl font-bold">{{ course.title.charAt(0) }}</span>
          </div>
        </div>
      </div>

      <!-- Course Details Section -->
      <div class="card-body space-y-6">
        <!-- Course Title -->
        <h2 class="text-2xl font-bold text-gray-800">{{ course.title }}</h2>

        <!-- Course Description -->
        <p class="text-gray-600 text-justify">{{ course.description }}</p>

        <!-- Course Metadata -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <svg
              class="w-5 h-5 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p class="text-gray-600">
              Users who have taken this course:
              <span class="text-gray-900"> {{ totalUsersEnrolled }}</span>
            </p>
          </div>

          <div class="flex items-center gap-4">
            <svg
              class="w-5 h-5 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p class="text-gray-600">
              Last updated:
              <span class="text-gray-900"> {{ formatDate(course.updated_at) }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
