<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const courseId = computed(() => route.params.courseId)

const loading = ref(false)
const error = ref(null)
const modules = ref([])

const fetchModules = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await Axios.get(`/courses/user/${courseId.value}/modules`)

    if (!data.success) {
      throw new Error(data?.message || 'Failed to fetch modules')
    }

    modules.value = data.course
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch modules'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchModules()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Main Title -->
    <h2 class="text-2xl font-semibold text-gray-800">Course Modules</h2>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 mb-2">{{ error }}</div>
      <button
        @click="fetchModules"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>

    <!-- Course Content -->
    <div v-else-if="modules" class="card">
      {{ modules }}
    </div>
  </div>
</template>
