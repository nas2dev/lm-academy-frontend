<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import CourseModuleModal from '@/components/Dashboard/Admin/CourseModule/CourseModuleModal.vue'
import DataTable from '@/components/Dashboard/General/DataTable.vue'
import PlusIcon from '@/assets/fonts/feather-icons/icons/add-icon.svg?component'
import EditIcon from '@/assets/fonts/feather-icons/icons/edit-icon.svg?component'
import TrashIcon from '@/assets/fonts/feather-icons/icons/delete-icon.svg?component'

const route = useRoute()
const toast = useToast()
const courseId = computed(() => route.params.courseId)

const modules = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref(null)
const courseTitle = ref('')

const showModal = ref(false)
const selectedModuleId = ref(null)

// create var ref table

const searchTerm = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const columns = [
  { key: 'nr', label: 'Nr' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'section_nr', label: 'Section Nr' },
  { key: 'sections', label: 'Sections' },
  { key: 'actions', label: 'Actions' },
]

const handleSearch = (term) => {
  searchTerm.value = term
  currentPage.value = 1
  fetchModules()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchModules()
}

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage
  currentPage.value = 1
  fetchModules()
}

const handleRefresh = () => {
  fetchModules()
}

const fetchModules = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      per_page: perPage.value,
      course_id: courseId.value,
    })

    if (searchTerm.value) params.append('searchTerm', searchTerm.value)

    const { data } = await Axios.get(`/modules?${params.toString()}`)

    if (!data.success) throw new Error(data?.message || 'Failed to fetch modules')

    modules.value = data.modules.data.map((module, index) => ({
      ...module,
      nr: (currentPage.value - 1) * perPage.value + index + 1,
    }))

    pagination.value = {
      current_page: data.modules.current_page,
      per_page: data.modules.per_page,
      total: data.modules.total,
      last_page: data.modules.last_page,
      from: data.modules.from,
      to: data.modules.to,
      prev_page_url: data.modules.prev_page_url,
      next_page_url: data.modules.next_page_url,
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch modules'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const fetchCourseTitle = async () => {
  try {
    const { data } = await Axios.get(`/courses/${courseId.value}`)
    if (!data.success) throw new Error(data?.message || 'Failed to fetch course title')
    courseTitle.value = data.course.title
  } catch (err) {
    console.error(err)
    toast.error(err.response?.data?.message || err.message || 'Failed to fetch course title')
  }
}

const handleCreateModule = () => {
  selectedModuleId.value = null
  showModal.value = true
}

const handleEdit = (module) => {
  console.log(module)

  toast.info('Edit module feature is not available yet')
}
const handleDelete = async (module) => {
  const result = await Swal.fire({
    title: 'Delete Module',
    text: `Are you sure you want to delete "${module.title}"? This action cannot be undone.`,
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
    const { data } = await Axios.delete(`/modules/${module.id}`)
    if (!data.success) throw new Error(data?.message || 'Failed to delete module')

    const index = modules.value.findIndex((m) => m.id === module.id)
    if (index !== -1) {
      modules.value.splice(index, 1)
    }

    toast.success(data.message || 'Module deleted successfully')

    fetchModules()
  } catch (err) {
    console.error('Error deleting module', err)
    toast.error(err.response?.data?.message || err.message || 'Failed to delete module')
  }
}

const handleModalClose = () => {
  showModal.value = false
  selectedModuleId.value = null
}

const handleModalSuccess = () => {
  fetchModules()
}

onMounted(() => {
  fetchCourseTitle()
  fetchModules()
})
</script>
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-semibold text-gray-800">Course Modules</h2>
      </div>
      <div>
        <router-link
          :to="{ name: 'EditCoursePage', params: { courseId: courseId } }"
          class="text-sm font-semibold text-[#1F8EFA] hover:text-[#1979d6] hover:underline"
        >
          Course
        </router-link>
        <span class="text-gray-500 mx-2">|</span>
        <router-link
          :to="{ name: 'AdminCourseModuleViewPage', params: { courseId: courseId } }"
          class="text-sm font-semibold text-[#1F8EFA] hover:text-[#1979d6] hover:underline"
        >
          Modules
        </router-link>
      </div>
    </div>

    <DataTable
      :title="`The list of modules for the &quot;${courseTitle}&quot; Course`"
      :columns="columns"
      :data="modules"
      :loading="loading"
      :error="error"
      :pagination="pagination"
      @search="handleSearch"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
      @refresh="handleRefresh"
    >
      <template #header-action>
        <button
          type="button"
          class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0085DB] text-white text-sm font-semibold shadow hover:bg-[#1979d6] transition"
          @click="handleCreateModule"
        >
          Create Module <PlusIcon />
        </button>
      </template>

      <template #cell-description="{ row }">
        <div class="text-sm text-gray-700 max-w-md truncate" :title="row.description">
          {{ row.description || 'N/A' }}
        </div>
      </template>

      <template #cell-sections="{ row }">
        <router-link
          to="#"
          target="_blank"
          class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-all duration-200 group flex items-center gap-1"
        >
          <span>Check</span>
          <span class="inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </router-link>
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

    <CourseModuleModal
      :is-open="showModal"
      :course-id="courseId"
      :course-title="courseTitle"
      :module-id="selectedModuleId"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />
  </div>
</template>
