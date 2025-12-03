<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import { getStorageUrl } from '@/utils/backendHelper'
import folderLineIcon from '@/assets/images/folder-line.png'
import foldersLineIcon from '@/assets/images/folders-line.png'
import FileLineIcon from '@/assets/images/file-line.png'
import movieLineIcon from '@/assets/images/movie-line.png'

const route = useRoute()
const toast = useToast()
const router = useRouter()

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

const formatDuration = (minutes) => {
  if (!minutes) return '00:00'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:00`
}

const toggleModule = (index) => {
  expandedModules.value[index] = !expandedModules.value[index]
}

const handleStartCourse = async () => {
  try {
    loading.value = true
    const { data } = await Axios.post(`/courses/user/${courseId.value}/enroll`)

    if (!data.success) {
      throw new Error(data?.message || 'Failed to start course')
    }

    toast.success(data.message || 'Successfully enrolled in the course')

    // Push router to the course modules view
    await fetchCourseDetails()

    router.push({ name: 'UserCourseModulesPage', params: { courseId: courseId.value } })
  } catch (err) {
    console.error(err)
    const errorMessage = err.response?.data?.message || err.message || 'Failed to start course'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const handleContinueCourse = () => {
  router.push({ name: 'UserCourseModulesPage', params: { courseId: courseId.value } })
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

        <!-- Course Content Section -->
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-gray-800">Course Content</h3>

          <!-- Hierarchical Content List -->
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <img :src="folderLineIcon" alt="Modules" class="w-5 h-5" />
              <p class="text-gray-800">{{ totalModules }} Modules</p>
            </div>

            <div class="flex items-center gap-3 pl-8">
              <img :src="foldersLineIcon" alt="Sections" class="w-5 h-5" />
              <p class="text-gray-800">{{ totalSections }} Sections</p>
            </div>

            <div class="flex items-center gap-3 pl-16">
              <img :src="FileLineIcon" alt="Files" class="w-5 h-5" />
              <p class="text-gray-800">{{ course.files }} Files</p>
            </div>

            <div class="flex items-center gap-3 pl-16">
              <img :src="movieLineIcon" alt="Duration" class="w-5 h-5" />
              <p class="text-gray-800">
                {{ formatDuration(course.duration) }} minutes total length
              </p>
            </div>
          </div>

          <!-- Modules Accordion -->
          <div class="w-full !mt-8 border border-gray-300 rounded-lg overflow-hidden">
            <div
              v-for="(module, index) in course.modules"
              :key="module.id"
              class="bg-gray-50 p-6 border-b border-gray-200 shadow-sm"
              :class="{
                'border-b-0': index === course.modules.length - 1,
              }"
            >
              <!-- Module Header -->
              <div
                class="flex justify-between items-center cursor-pointer"
                @click="toggleModule(index)"
              >
                <div class="flex items-center gap-4">
                  <svg
                    class="w-5 h-5 text-gray-800 transition-transform"
                    :class="{ 'rotate-180': expandedModules[index] }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <h4 class="font-semibold text-gray-800">{{ module.title }}</h4>
                </div>
                <p class="text-gray-600 text-sm">
                  {{ module.total_sections }} Sections -
                  {{ formatDuration(module.duration) }} minutes
                </p>
              </div>
              <!-- Module Sections (Expanded Content) -->
              <div v-if="expandedModules[index]" class="pl-9 mt-4 space-y-4">
                <div
                  v-for="section in module.sections"
                  :key="section.id"
                  class="flex justify-between items-center"
                >
                  <div class="flex items-center gap-4">
                    <svg
                      class="w-4 h-4 text-gray-800"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p class="text-gray-800">{{ section.title }}</p>
                  </div>
                  <p class="text-gray-600 text-sm">
                    {{ formatDuration(section.duration) }} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="w-full pt-4">
          <button
            v-if="courseStatus === 'new'"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
            @click="handleStartCourse"
          >
            <span v-if="loading">Enrolling...</span>
            <span v-else>Start Course</span>
          </button>
          <button
            v-else
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
            @click="handleContinueCourse"
          >
            <span>Continue Course</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
