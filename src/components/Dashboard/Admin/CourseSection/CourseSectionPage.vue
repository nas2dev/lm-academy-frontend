<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import CourseSectionModal from '@/components/Dashboard/Admin/CourseSection/CourseSectionModal.vue'
import DataTable from '@/components/Dashboard/General/DataTable.vue'
import PlusIcon from '@/assets/fonts/feather-icons/icons/add-icon.svg?component'
import EditIcon from '@/assets/fonts/feather-icons/icons/edit-icon.svg?component'
import TrashIcon from '@/assets/fonts/feather-icons/icons/delete-icon.svg?component'

const route = useRoute()
const toast = useToast()
const moduleId = computed(() => route.params.moduleId)
const courseId = ref(1)

const sections = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref(null)
const moduleTitle = ref('')

const showModal = ref(false)
const selectedSectionId = ref(null)

// create var ref table

const searchTerm = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const columns = [
  { key: 'nr', label: 'Nr' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'materials', label: 'Materials' },
  { key: 'material', label: 'Material' },
  { key: 'actions', label: 'Actions' },
]

const handleSearch = (term) => {
  searchTerm.value = term
  currentPage.value = 1
  fetchSections()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchSections()
}

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage
  currentPage.value = 1
  fetchSections()
}

const handleRefresh = () => {
  fetchSections()
}

const fetchSections = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      per_page: perPage.value,
      module_id: moduleId.value,
    })

    if (searchTerm.value) params.append('searchTerm', searchTerm.value)

    const { data } = await Axios.get(`/sections?${params.toString()}`)

    if (!data.success) throw new Error(data?.message || 'Failed to fetch sections')

    sections.value = data.sections.data.map((section, index) => ({
      ...section,
      nr: (currentPage.value - 1) * perPage.value + index + 1,
    }))

    console.log('sections', data)

    courseId.value = data?.course_id ? data?.course_id : null

    pagination.value = {
      current_page: data.sections.current_page,
      per_page: data.sections.per_page,
      total: data.sections.total,
      last_page: data.sections.last_page,
      from: data.sections.from,
      to: data.sections.to,
      prev_page_url: data.sections.prev_page_url,
      next_page_url: data.sections.next_page_url,
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch sections'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const fetchModuleTitle = async () => {
  try {
    const { data } = await Axios.get(`/modules/${moduleId.value}`)
    if (!data.success) throw new Error(data?.message || 'Failed to fetch module title')
    moduleTitle.value = data.module.title
  } catch (err) {
    console.error(err)
    toast.error(err.response?.data?.message || err.message || 'Failed to fetch module title')
  }
}

const handleCreateModule = () => {
  selectedSectionId.value = null
  showModal.value = true
}

const handleEdit = (section) => {
  selectedSectionId.value = section.id
  showModal.value = true
}
const handleDelete = async (section) => {
  const result = await Swal.fire({
    title: 'Delete Section',
    text: `Are you sure you want to delete "${section.title}"? This action cannot be undone.`,
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
    const { data } = await Axios.delete(`/sections/${section.id}`)
    if (!data.success) throw new Error(data?.message || 'Failed to delete section')

    const index = sections.value.findIndex((s) => s.id === section.id)
    if (index !== -1) {
      sections.value.splice(index, 1)
    }

    toast.success(data.message || 'Section deleted successfully')

    fetchSections()
  } catch (err) {
    console.error('Error deleting section', err)
    toast.error(err.response?.data?.message || err.message || 'Failed to delete section')
  }
}

const handleModalClose = () => {
  showModal.value = false
  selectedSectionId.value = null
}

const handleModalSuccess = () => {
  fetchSections()
}

const getMaterialRoute = (moduleId) => {
  return { name: 'AdminCourseSectionViewPage', params: { moduleId } }
}

onMounted(() => {
  fetchModuleTitle()
  fetchSections()
})
</script>
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-semibold text-gray-800">Course Sections</h2>
      </div>
      <div>
        <router-link
          :to="{ name: 'AdminCourseViewPage' }"
          class="text-sm font-semibold text-[#1F8EFA] hover:text-[#1979d6] hover:underline"
        >
          Courses
        </router-link>
        <span class="text-gray-500 mx-2">|</span>
        <router-link
          v-if="courseId"
          :to="{ name: 'AdminCourseModuleViewPage', params: { courseId: courseId } }"
          class="text-sm font-semibold text-[#1F8EFA] hover:text-[#1979d6] hover:underline"
        >
          Modules
        </router-link>
      </div>
    </div>
    <DataTable
      :title="`The list of sections for the &quot;${moduleTitle}&quot; Module`"
      :columns="columns"
      :data="sections"
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
          Create Section <PlusIcon />
        </button>
      </template>

      <template #cell-description="{ row }">
        <div class="text-sm text-gray-700 max-w-md truncate" :title="row.description">
          {{ row.description || 'N/A' }}
        </div>
      </template>

      <template #cell-material="{ row }">
        <router-link
          :to="getMaterialRoute(row.id)"
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

    <CourseSectionModal
      :is-open="showModal"
      :module-id="moduleId"
      :module-title="moduleTitle"
      :section-id="selectedSectionId"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />
  </div>
</template>
