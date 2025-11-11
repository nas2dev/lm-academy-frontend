<script setup>
import DataTable from '@/components/Dashboard/General/DataTable.vue'
import { ref, onMounted } from 'vue'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()

const courses = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref(null)

const searchTerm = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const columns = [
  { key: 'nr', label: 'Nr' },
  { key: 'title', label: 'Title' },
  { key: 'duration', label: 'Duration (min)' },
  { key: 'files', label: 'Files' },
  { key: 'created_by', label: 'Created By' },
  { key: 'created_at', label: 'Created ' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

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

    const { data } = await Axios.get(`/courses?${params.toString()}`)

    courses.value = data.courses.data.map((course, index) => ({
      ...course,
      nr: (currentPage.value - 1) * perPage.value + index + 1,
      statusLabel: course.status ? 'Active' : 'Inactive',
    }))

    // console.log('courses', courses.value);
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
  } catch (error) {
    console.error('Error fetching courses', error)
    error.value = error.response?.data?.message || 'Failed to fetch courses'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h6 class="text-lg text-gray-500 font-semibold mb-6">Admin Course Page</h6>
      <p class="text-sm text-gray-400">This is a admin course page</p>
      <ul></ul>
      <p>{{ courses }}</p>
      <p>{{ pagination }}</p>
      <!-- <ul>
        <li v-for="course in courses" :key="course.id">
          <h2>{{ course.title }}</h2>
          <p>{{ course.description }}</p>
          <p>{{ course.duration }}</p>
          <p>{{ course.files }}</p>
        </li>
      </ul> -->
    </div>
  </div>
</template>
