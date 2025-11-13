<script setup>
import EditCourseForm from '@/components/Dashboard/Admin/Course/EditCourseForm.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const courseId = route.params.courseId
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold text-gray-800">Edit Course</h2>
      <router-link
        :to="{ name: 'AdminCoureseViewPage' }"
        class="text-sm font-semibold text-[#1F8EFA] hover:text-[#1979d6]"
      >
        Modules
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <EditCourseForm :course-id="courseId" />
      </div>
    </div>
  </div>
</template>
