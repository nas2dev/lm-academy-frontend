<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import { getStorageUrl } from '@/utils/backendHelper'
import RoundedDoneIcon from '@/assets/fonts/feather-icons/icons/rounded-done.svg?component'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const error = ref(null)
const sectionData = ref(null)
const section = ref(null)
const module = ref(null)
const course = ref(null)
const courseMaterials = ref(null)
const sectionCompleted = ref(false)
const nextStep = ref(null)
const previousStep = ref(null)
const courseCompleted = ref(false)

const courseId = computed(() => route.params.courseId)
const sectionId = computed(() => route.params.sectionId)

// computed properties for button states
const isFirstSection = computed(() => {
  return previousStep.value?.type === 'course_start'
})

const isLastSectionOfModule = computed(() => {
  return nextStep.value?.type === 'next_module'
})

const isLastSectionOfCourse = computed(() => {
  return nextStep.value?.type === 'course_end' || courseCompleted.value
})

const getMaterialUrl = (material) => {
  if (!material.material_url) return null
  return getStorageUrl(material.material_url, null)
}

const handleDownloadFile = (material) => {
  const url = getMaterialUrl(material)
  if (url) {
    window.open(url, '_blank')
  }
}

const handlePreviousSection = () => {
  if (previousStep.value && previousStep.value.section_id) {
    router.push({
      name: 'UserCourseSectionPage',
      params: {
        courseId: courseId.value,
        sectionId: previousStep.value.section_id,
      },
    })
  }
}

const handleEndOfModule = () => {
  router.push({
    name: 'UserCourseModulesPage',
    params: {
      courseId: courseId.value,
    },
  })
}

const handleNextSection = () => {
  if (nextStep.value && nextStep.value.section_id) {
    router.push({
      name: 'UserCourseSectionPage',
      params: {
        courseId: courseId.value,
        sectionId: nextStep.value.section_id,
      },
    })
  }
}

const handleMarkAsCompleted = async () => {
  try {
    loading.value = true
    const endpoint = sectionCompleted.value
      ? `/materials/user/section/${sectionId.value}/incomplete`
      : `/materials/user/section/${sectionId.value}/complete`

    console.log('endpoint', endpoint)

    const data = { success: true, message: 'Section status updated successfully' } // temporary data
    //   const { data } = await Axios.post(endpoint)

    if (!data.success) {
      throw new Error(data?.message || 'Failed to update section status')
    }

    toast.success(
      data.message ||
        (sectionCompleted.value ? 'Section marked as incomplete' : 'Section marked as complete'),
    )

    // refresh data
    await fetchSectionDetails()
  } catch (err) {
    console.error('Error marking section', err)
    error.value = err.response?.data?.message || err.message || 'Failed to update sections status'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const fetchSectionDetails = async () => {
  loading.value = true
  error.value = null

  try {
    const { data } = await Axios.get(`/materials/user/section/${sectionId.value}`)

    if (!data.success) {
      throw new Error(data?.message || 'Failed to load section details')
    }
    sectionData.value = data.section
    section.value = data.section
    module.value = data.module
    course.value = data.course
    courseMaterials.value = data.courseMaterials || []
    sectionCompleted.value = data.section_completed
    nextStep.value = data.next_step
    previousStep.value = data.previous_step
    courseCompleted.value = data.course_completed
  } catch (err) {
    console.error('Error fetching section details', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load section details'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

watch(
  () => sectionId.value,
  (newSectionId, oldSectionId) => {
    if (newSectionId && newSectionId !== oldSectionId) {
      fetchSectionDetails()
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchSectionDetails()
})
</script>

<template>
  <div class="w-full py-4 flex flex-col justify-start items-start gap-6">
    <p class="text-2xl font-semibold text-black">Course Section</p>

    <!-- loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12 w-full">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8 w-full">
      <div class="text-red-500 mb-2">{{ error }}</div>
      <button
        type="button"
        @click="fetchSectionDetails"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>

    <!-- Section Content in Card -->
    <div v-else-if="section" class="w-full">
      <div class="card">
        <div class="card-body space-y-6">
          <!-- course title -->
          <h2 v-if="course" class="text-base font-semibold text-gray-400">{{ course.title }}</h2>

          <!-- horizontal divider -->
          <div v-if="courseMaterials.length > 0" class="border-t border-gray-200"></div>
          <!-- section title -->

          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">{{ section.title }}</h3>
            <p v-if="section.description" class="text-gray-600 whitespace-pre-line loading-relaxed">
              {{ section.description }}
            </p>
          </div>
          <!-- horizontal divider -->
          <div v-if="courseMaterials.length > 0" class="border-t border-gray-200"></div>

          <!-- section Materials -->
          <template v-for="(material, index) in courseMaterials" :key="material.id">
            <!-- Material Content -->
            <div>
              <!-- Text Material -->
              <div v-if="material.type === 'text'">
                <h4 class="text-lg font-bold text-gray-800 mb-3">{{ material.title }}</h4>
                <p class="text-gray-600 whitespace-pre-line loading-relaxed">
                  {{ material.content || 'No content provided.' }}
                </p>
              </div>

              <!-- Image Material -->
              <div v-else-if="material.type === 'image'">
                <h4 class="text-lg font-bold text-gray-800 mb-3">{{ material.title }}</h4>
                <div
                  class="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center"
                >
                  <img
                    v-if="getMaterialUrl(material)"
                    :src="getMaterialUrl(material)"
                    :alt="material.title"
                    class="max-h-[400px] object-contain rounded-lg"
                  />
                  <div v-else class="text-gray-400">No image available</div>
                </div>
              </div>

              <!-- Video Material -->
              <div v-else-if="material.type === 'video'">
                <h4 class="text-lg font-bold text-gray-800 mb-3">{{ material.title }}</h4>
                <div
                  class="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center"
                >
                  <video
                    v-if="getMaterialUrl(material)"
                    :src="getMaterialUrl(material)"
                    controls
                    class="w-full max-h-[500px] rounded-lg bg-black"
                  />
                  <div v-else class="text-gray-400">No video available</div>
                </div>
                <!-- <p v-if="material.title" class="text-gray-600 mt-4 text-center">
                  {{ material.title }}
                </p> -->
              </div>

              <!-- File Material (PDF, XLS, ETC) -->
              <div v-else-if="material.type === 'file'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <!-- File Icon -->
                    <svg
                      class="w-8 h-8 text-gray-800"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span class="text-lg font-semibold text-gray-800">{{ material.title }}</span>
                  </div>

                  <button
                    type="button"
                    @click="handleDownloadFile(material)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-1 rounded-full font-semibold transition-colors duration-200"
                  >
                    Download File
                  </button>
                </div>
              </div>
            </div>
            <!-- horizontal divider -->
            <div v-if="index < courseMaterials.length - 1" class="border-t border-gray-200"></div>
          </template>

          <!-- Bottom Navigation Buttons -->
          <div class="flex justify-between items-center gap-4 pt-6 border-t border-gray-200">
            <!-- left side: Mark as complete/incomplete button -->
            <button
              @click="handleMarkAsCompleted"
              :disabled="loading"
              class="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold text-white transition-colors"
              :style="
                sectionCompleted
                  ? { backgroundColor: '#FB977D', borderColor: '#FB977D' }
                  : { backgroundColor: '#28A745', borderColor: '#28A745' }
              "
              style="border: 2px solid"
            >
              <span>{{ sectionCompleted ? 'Mark as Incomplete' : 'Mark as Complete' }}</span>
              <RoundedDoneIcon />
            </button>

            <!-- right side: Navigation Buttons -->
            <div class="flex items-center gap-4">
              <!-- Previous Section Button -->
              <button
                v-if="!isFirstSection && previousStep && previousStep.section_id"
                class="flex items-center gap-2 px-5 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                @click="handlePreviousSection"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Previous Section</span>
              </button>

              <!-- Next Section Button -->
              <button
                v-if="nextStep && nextStep?.section_id && !isLastSectionOfModule"
                class="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                @click="handleNextSection"
              >
                <span>Next Section</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <!-- End od Module Button -->
              <button
                v-else-if="isLastSectionOfModule"
                class="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                @click="handleEndOfModule"
              >
                <span>End Of Module</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <!-- End of course Button -->
              <button
                v-else-if="isLastSectionOfCourse"
                disabled
                class="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed"
              >
                <span>End of Course</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
