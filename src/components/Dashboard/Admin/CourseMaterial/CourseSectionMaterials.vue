<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Axios from '@/utils/axios'
import addBtnIcon from '@/assets/images/add.png'
import BreadCrumbs from '@/components/Dashboard/General/BreadCrumbs.vue'

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
  toast.info('Material creation flow is coming soon!')
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

      <div
        v-for="material in materials"
        :key="material.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6"
      >
        {{ material }}
      </div>
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
  </div>
</template>
