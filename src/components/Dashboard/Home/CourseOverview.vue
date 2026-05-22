<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  courseOverview: {
    type: Array,
    required: true,
    default: () => []
  }
})

const router = useRouter()

const limitedCourses = computed(() => {
  return props.courseOverview ? props.courseOverview.slice(0, 10) : []
})

const openCourse = (courseId) => {
  const routeData = router.resolve({ name: 'AdminCourseModuleViewPage', params: { courseId } })
  window.open(routeData.href, '_blank')
}
</script>

<template>
  <div class="card h-full">
    <div class="card-body">
      <div class="flex items-center justify-between mb-5">
        <h4 class="text-gray-500 text-lg font-semibold">Course Overview</h4>
        <router-link
          :to="{ name: 'AdminCourseViewPage' }"
          class="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
        >
          Manage Courses →
        </router-link>
      </div>

      <div v-if="limitedCourses && limitedCourses.length > 0" class="space-y-3">
        <div
          v-for="course in limitedCourses"
          :key="course.id"
          class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          @click="openCourse(course.id)"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500">
              <span class="text-blue-600 font-bold text-sm">{{ course.title?.charAt(0) }}</span>
            </div>
            <h5 class="text-gray-500 font-medium text-sm">{{ course.title }}</h5>
          </div>
          <div class="flex items-center gap-2">
            <i class="ti ti-users text-gray-400 text-sm"></i>
            <span class="text-gray-500 font-semibold text-sm">{{ course.enrolled_count }}</span>
            <span class="text-gray-400 text-xs">enrolled</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-8">
        <i class="ti ti-book-off text-4xl text-gray-400 mb-3 block opacity-60"></i>
        <p class="text-gray-400 text-sm">No courses created yet</p>
        <router-link
          :to="{ name: 'CreateCoursePage' }"
          class="inline-block mt-3 px-5 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
        >
          Create Course
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
