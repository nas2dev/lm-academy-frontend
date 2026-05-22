<script setup>
import { computed } from 'vue'
import { getStorageUrl } from '@/utils/backendHelper'
import { useRouter } from 'vue-router'

const props = defineProps({
  activeCourses: {
    type: Array,
    required: true,
    default: () => []
  }
})

const router = useRouter()

const limitedCourses = computed(() => {
  return props.activeCourses ? props.activeCourses.slice(0, 10) : []
})

const getThumbnailUrl = (thumbnail) => {
  return thumbnail ? getStorageUrl(thumbnail, null) : null
}

const getProgressColor = (progress) => {
  if (progress >= 75) return '#4BD08B'
  if (progress >= 40) return '#46CAEB'
  if (progress > 0) return '#F8C076'
  return '#E7ECF0'
}

const openCourse = (courseId) => {
  const routeData = router.resolve({ name: 'UserCourseDetailPage', params: { courseId } })
  window.open(routeData.href, '_blank')
}
</script>

<template>
  <div class="card h-full">
    <div class="card-body">
      <div class="flex items-center justify-between mb-5">
        <h4 class="text-gray-500 text-lg font-semibold">My Active Courses</h4>
        <router-link
          :to="{ name: 'UserCourseViewPage' }"
          class="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
        >
          View All →
        </router-link>
      </div>

      <!-- Courses list -->
      <div v-if="limitedCourses && limitedCourses.length > 0" class="space-y-4">
        <div
          v-for="course in limitedCourses"
          :key="course.id"
          class="course-item flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          @click="openCourse(course.id)"
        >
          <!-- Course Thumbnail -->
          <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              v-if="getThumbnailUrl(course.thumbnail)"
              :src="getThumbnailUrl(course.thumbnail)"
              :alt="course.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-blue-50">
              <span class="text-blue-600 font-bold text-lg">{{ course.title?.charAt(0) }}</span>
            </div>
          </div>

          <!-- Course Info -->
          <div class="flex-1 min-w-0">
            <h5 class="text-gray-500 font-semibold text-sm truncate">{{ course.title }}</h5>
            <div class="flex items-center gap-3 mt-2">
              <!-- Progress Bar -->
              <div class="progress-bar-container flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500 ease-out"
                  :style="{
                    width: `${course.progress || 0}%`,
                    backgroundColor: getProgressColor(course.progress || 0)
                  }"
                ></div>
              </div>
              <span class="text-xs font-semibold text-gray-400 whitespace-nowrap">
                {{ course.progress || 0 }}%
              </span>
            </div>
          </div>

          <!-- Arrow -->
          <i class="ti ti-chevron-right text-gray-400 text-lg"></i>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-8">
        <i class="ti ti-book-off text-4xl text-gray-400 mb-3 block opacity-60"></i>
        <p class="text-gray-400 text-sm">No active courses yet</p>
        <router-link
          :to="{ name: 'UserCourseViewPage' }"
          class="inline-block mt-3 px-5 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
        >
          Browse Courses
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-item {
  transition: background-color 0.15s ease;
}

.progress-bar-container {
  transition: background-color 0.15s ease;
}

.course-item:hover .progress-bar-container {
  background-color: #e5e7eb;
}
</style>
