<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import addBtnIcon from '@/assets/images/add.png'
import BreadCrumbs from '@/components/Dashboard/General/BreadCrumbs.vue'
import MaterialCard from '@/components/Dashboard/Admin/CourseMaterial/MaterialCard.vue'
import CourseCreateMaterialModal from '@/components/Dashboard/Admin/CourseMaterial/CourseCreateMaterialModal.vue'

const route = useRoute()
const toast = useToast()
const sectionId = computed(() => route.params.sectionId)

const loading = ref(false)
const error = ref(null)
const showScrollButton = ref(false)
const sectionInfo = ref(null)
const moduleInfo = ref(null)
const courseInfo = ref(null)
const materials = ref([])

const fetchMaterials = async () => {
  if (!sectionId.value) return
  loading.value = true
  error.value = null

  try {
    const { data } = await Axios.get(`/materials/section/${sectionId.value}`)

    if (!data.success) {
      throw new Error(data?.message || 'Failed to fetch materials')
    }

    sectionInfo.value = data.section
    moduleInfo.value = data.module
    courseInfo.value = data.course

    materials.value = (data.materials || []).map((material, index) => ({
      ...material,
      nr: index + 1,
      extension: material.material_url
        ? material.material_url.split('.').pop().toLowerCase()
        : null,
    }))
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch materials'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMaterials()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleCreateMaterial = () => {
  selectedMaterialId.value = null
  showCreateModal.value = true
}

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 100
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// Drag and Drop functions
const draggedIndex = ref(null)
const draggedOverIndex = ref(null)

const handleUpdateMaterial = (material) => {
  showCreateModal.value = true
  selectedMaterialId.value = material.id
}

const handleDeleteMaterial = async (material) => {
  const result = await Swal.fire({
    title: 'Delete Material',
    text: `Are you sure you want to delete "${material.title}" ? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      confirmButton: 'bg-swalConfirm text-white hover:bg-swalConfirm/80',
      cancelButton: 'bg-swalCancel text-white hover:bg-swalCancel/80',
    },
  })

  if (!result.isConfirmed) {
    return
  }

  try {
    const { data } = await Axios.delete(`/materials/${material.id}`)

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete material')
    }

    toast.success(data.message || 'Material deleted successfully.')

    // Remove the material from the list without refreshing
    const index = materials.value.findIndex((m) => m.id === material.id)
    if (index !== -1) {
      materials.value.splice(index, 1)
      // Update nr numbers for remaining materials
      materials.value.forEach((m, idx) => {
        m.nr = idx + 1
      })
    }
  } catch (err) {
    console.log('error: ', err)
    toast.error(
      err.response?.data?.message ||
        err.message ||
        'Failed to delete material. Please try again later.',
    )
  }
}

const moveUp = () => {
  console.log('Material moved up')
}

const moveDown = () => {
  console.log('Material moved down')
}

const handleDragStart = () => {
  console.log('Material dragged start')
}

const handleDragOver = () => {
  console.log('Material dragged over')
}

const handleDragLeave = () => {
  console.log('Material dragged leave')
}

const handleDrop = () => {
  console.log('Material dropped')
}

const handleDragEnd = () => {
  console.log('Material dragged end')
}

// Create Material Modal
const showCreateModal = ref(false)
const selectedMaterialId = ref(null)

const handleCloseModal = () => {
  showCreateModal.value = false
  selectedMaterialId.value = null
}

const handleMaterialCreated = (updateMaterial) => {
  if (selectedMaterialId.value) {
    // Update mode - update the material in the list
    // TODO: Implement this
  } else if (updateMaterial && updateMaterial.id) {
    // Create mode - Add the new material to the list without refresh
    const materialWithMetadata = {
      ...updateMaterial,
      nr: materials.value.length + 1,
      extension: updateMaterial.material_url
        ? updateMaterial.material_url.split('.').pop().toLowerCase()
        : null,
      created_by: updateMaterial.created_by || null,
      updated_by: updateMaterial.updated_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    materials.value.push(materialWithMetadata)
  } else {
    // Video upload or fallback: refresh to get the new material with all metadata
    // Only refresh if we truly don't have material data (e.g., video uploads)
    fetchMaterials()
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold text-gray-800">Course Section Materials</h2>
        <button
          type="button"
          class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1F8EFA] text-white text-sm font-semibold shadow hover:bg-[#1979d6] transition"
          @click="handleCreateMaterial"
        >
          <span class="flex items-center justify-center w-6 h-6 rounded-full bg-white/30">
            <img :src="addBtnIcon" alt="Add Icon" class="w-4 h-4" />
          </span>
          <span>New Material</span>
        </button>
      </div>

      <BreadCrumbs
        class="self-start"
        :courseTitle="courseInfo?.title || 'Course'"
        :courseLink="
          courseInfo
            ? `/dashboard/manage/courses/${courseInfo.id}/edit`
            : '/dashboard/manage/courses'
        "
        :moduleTitle="moduleInfo?.title || 'Module'"
        :moduleLink="moduleInfo ? `/dashboard/manage/courses/${moduleInfo.id}/modules` : null"
        :sectionTitle="sectionInfo?.title || 'Section'"
        :sectionLink="sectionInfo ? `/dashboard/manage/modules/${sectionInfo.id}/sections` : null"
      />

      <div class="text-sm text-gray-600 space-y-2">
        <p class="font-medium text-gray-900" v-if="sectionInfo">{{ sectionInfo?.title }}</p>
        <p class="text-gray-700" v-if="sectionInfo">
          {{ sectionInfo?.description || 'No description provided for this section' }}
        </p>
      </div>
    </div>

    <div
      v-if="loading"
      class="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500"
    >
      Loading materials...
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
      {{ error }}
    </div>

    <div v-else>
      <div
        v-if="materials.length === 0"
        class="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500"
      >
        No materials found for this section.
      </div>
      <TransitionGroup name="material-list" tag="div">
        <MaterialCard
          v-for="(material, index) in materials"
          :key="material.id"
          :material="material"
          :index="index"
          :totalMaterials="materials.length"
          :draggedIndex="draggedIndex"
          :draggedOverIndex="draggedOverIndex"
          @update="handleUpdateMaterial"
          @delete="handleDeleteMaterial"
          @moveUp="moveUp"
          @moveDown="moveDown"
          @dragStart="handleDragStart"
          @dragOver="handleDragOver"
          @dragLeave="handleDragLeave"
          @drop="handleDrop"
          @dragEnd="handleDragEnd"
        />
      </TransitionGroup>
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1F8EFA] text-white text-sm font-semibold shadow hover:bg-[#1979d6] transition"
        @click="handleCreateMaterial"
      >
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-white/30">
          <img :src="addBtnIcon" alt="Add Icon" class="w-4 h-4" />
        </span>
        <span>New Material</span>
      </button>
    </div>

    <button
      v-if="showScrollButton"
      type="button"
      @click="scrollToTop"
      aria-label="Scroll to top"
      class="fixed bottom-5 right-5 bg-[#1F8EFA] text-white w-10 h-10 rounded-full shadow-lg hover:bg-[#1979d6] transition flex items-center justify-center"
    >
      ↑
    </button>

    <CourseCreateMaterialModal
      :isOpen="showCreateModal"
      :sectionId="Number(sectionId)"
      :materialId="selectedMaterialId"
      @close="handleCloseModal"
      @success="handleMaterialCreated"
    />
  </div>
</template>

<style scoped>
.material-list-move,
.material-list-enter-active,
.material-list-leave-active {
  transition: all 0.3s ease;
}

.material-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.material-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.material-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
