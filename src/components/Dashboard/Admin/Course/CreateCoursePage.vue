<script setup>
import CreateCourseForm from '@/components/Dashboard/Admin/Course/CreateCourseForm.vue'
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold text-gray-800">Create New Course</h2>
    </div>

    <div class="card">
      <div class="card-body">
        <CreateCourseForm />
      </div>
    </div>
  </div>
</template>
