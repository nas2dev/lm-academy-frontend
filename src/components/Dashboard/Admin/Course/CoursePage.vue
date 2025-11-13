<script setup>
import DataTable from '@/components/Dashboard/General/DataTable.vue'
import { ref, onMounted } from 'vue'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import EditIcon from '@/assets/fonts/feather-icons/icons/edit-icon.svg?component'
import TrashIcon from '@/assets/fonts/feather-icons/icons/delete-icon.svg?component'
import PlusIcon from '@/assets/fonts/feather-icons/icons/add-icon.svg?component'

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
  { key: 'created', label: 'Created' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const handleSearch = (term) => {
  searchTerm.value = term
  currentPage.value = 1
  fetchCourses()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchCourses()
}

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage
  currentPage.value = 1
  fetchCourses()
}

const handleRefresh = () => {
  fetchCourses()
}

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

    if (!data.success) throw new Error(data?.message || 'Failed to fetch courses')

    courses.value = data.courses.data.map((course, index) => ({
      ...course,
      nr: (currentPage.value - 1) * perPage.value + index + 1,
      statusLabel: course.status == 'Active' ? 'Active' : 'Inactive',
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

const promptStatusChange = async (course) => {
  const isCurrentlyActive = course.status === 'Active'

  const result = await Swal.fire({
    title: 'Change Course Status',
    text: isCurrentlyActive
      ? 'Are you sure you want to deactivate this course? Once deactivated, it will no longer be available to users until reactivated.'
      : 'Are you sure you want to activate this course? Once activated, it will be available to users immediately.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, change it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      confirmButton: 'bg-swalConfirm text-white hover:bg-swalConfirm/80',
      cancelButton: 'bg-swalCancel text-white hover:bg-swalCancel/80',
    },
  })

  if (!result.isConfirmed) return

  try {
    const { data } = await Axios.post('courses/change-status', {
      course_id: course.id,
      status: isCurrentlyActive ? 0 : 1,
    })

    if (!data.success) throw new Error(data?.message || 'Failed to change course status')

    const updatedStatus = data?.course?.status || (isCurrentlyActive ? 'Inactive' : 'Active')
    const updatedIsActive = updatedStatus === 'Active'

    const courseIndex = courses.value.findIndex((c) => c.id === course.id)

    if (courseIndex !== -1) {
      courses.value[courseIndex] = {
        ...courses.value[courseIndex],
        status: updatedStatus,
        statusLabel: updatedIsActive ? 'Active' : 'Inactive',
        isActive: updatedIsActive,
      }
    }

    toast.success(data?.message || 'Course status changed successfully')
  } catch (err) {
    console.error('Error changing course status', err)
    toast.error(err.response?.data?.message || err.message || 'Failed to change course status')
  }
}

const handleEdit = (course) => {
  router.push({ name: 'EditCoursePage', params: { courseId: course.id } })
}

const handleDelete = async (course) => {
  const result = await Swal.fire({
    title: 'Delete Course',
    text: `Are you sure you want to delete this "${course.title}"? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      confirmButton: 'bg-swalConfirm text-white hover:bg-swalConfirm/80',
      cancelButton: 'bg-swalCancel text-white hover:bg-swalCancel/80',
    },
  })

  if (!result.isConfirmed) return

  try {
    const { data } = await Axios.delete(`/courses/${course.id}`)

    if (!data.success) throw new Error(data?.message || 'Failed to delete course')

    const index = courses.value.findIndex((c) => c.id === course.id)

    if (index !== -1) {
      courses.value.splice(index, 1)
    }

    toast.success('Course deleted successfully')
  } catch (err) {
    console.error('Error deleting course', err)
    toast.error(err.response?.data?.message || err.message || 'Failed to delete course')
  }
}

const handleCreateCourse = () => {
  router.push({ name: 'CreateCoursePage' })
}

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h6 class="text-lg text-gray-500 font-semibold mb-6">Course</h6>
    </div>
    <DataTable
      title="The list of courses"
      :columns="columns"
      :data="courses"
      :loading="loading"
      :error="error"
      :pagination="pagination"
      search-placeholder="Search..."
      @search="handleSearch"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
      @refresh="handleRefresh"
    >
      <template #header-action>
        <button
          type="button"
          class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0085DB] text-white text-sm font-semibold shadow hover:bg-[#1979d6] transition"
          @click="handleCreateCourse"
        >
          Create Course <PlusIcon />
        </button>
      </template>

      <template #cell-created_by="{ row }">
        <div class="flex flex-col">
          <div class="text-sm font-medium text-gray-900">{{ row.first_name }}</div>
          <div class="text-sm font-medium text-gray-900">{{ row.last_name }}</div>
        </div>
      </template>

      <template #cell-status="{ row }">
        <button
          type="button"
          @click="promptStatusChange(row)"
          :class="[
            'px-14 py-3 text-sm font-medium rounded-full border cursor-pointer w-28 flex items-center justify-center transition-colors duration-200',
            row.status == 'Active'
              ? 'bg-white text-[#4BD08B] border-[#4BD08B] hover:bg-[#4BD08B] hover:text-white hover:border-[#4BD08B]'
              : 'bg-white text-[#FB977D] border-[#FB977D] hover:bg-[#FB977D] hover:text-white hover:border-[#FB977D]',
          ]"
        >
          {{ row.statusLabel }}
        </button>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="text-blue-500 hover:text-blue-600 transition flex items-center justify-center h-6 w-6 rounded-full"
            @click="handleEdit(row)"
            title="Edit"
          >
            <EditIcon />
          </button>

          <button
            type="button"
            class="text-red-500 hover:text-red-600 transition flex items-center justify-center h-6 w-6 rounded-full"
            @click="handleDelete(row)"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </template>
    </DataTable>
  </div>
</template>
