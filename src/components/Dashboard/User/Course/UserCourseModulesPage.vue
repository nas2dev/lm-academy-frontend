<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import RoundedDoneBlackIcon from '@/assets/fonts/feather-icons/icons/rounded-done-black.svg?component'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const courseId = computed(() => route.params.courseId)

const loading = ref(false)
const error = ref(null)
const modules = ref([])
const expanded = ref([])

const formatDurationForDisplay = (durationString) => {
  if (!durationString || durationString === '00:00') return '00:00'

  const parts = durationString.split(':')
  let hours = 0
  let minutes = 0
  let seconds = 0

  if (parts.length === 3) {
    // 12:12:12
    hours = parseInt(parts[0]) || 0
    minutes = parseInt(parts[1]) || 0
    seconds = parseInt(parts[2]) || 0
  } else if (parts.length === 2) {
    // 12:12
    minutes = parseInt(parts[0]) || 0
    seconds = parseInt(parts[1]) || 0
  }

  // convert to total minutes
  const totalMinutes = hours * 60 + minutes + (seconds > 0 ? 1 : 0) // Round up if seconds > 0

  return `${totalMinutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

const handleStartModule = (moduleId) => {
  if (modules?.value?.modules) {
    const module = modules.value.modules.find((m) => m.id === moduleId)
    if (module?.sections?.length > 0) {
      const firstSection = module.sections[0]
      if (firstSection?.id) {
        router.push({
          name: 'UserCourseSectionPage',
          params: {
            courseId: courseId.value,
            sectionId: firstSection.id,
          },
        })
      } else {
        toast.error('Section ID is required')
      }
    }
  } else {
    toast.error('No sections available for this module')
  }
}

const handleContinueModule = (moduleId) => {
  if (modules?.value?.modules) {
    const module = modules.value.modules.find((m) => m.id === moduleId)
    if (module?.sections?.length > 0) {
      const incompleteSection = module.sections.find((s) => !s.completed)
      if (incompleteSection?.id) {
        router.push({
          name: 'UserCourseSectionPage',
          params: {
            courseId: courseId.value,
            sectionId: incompleteSection.id,
          },
        })
      } else {
        // if all sections are completed, go to first section
        if (module.sections.length > 0 && module.sections[0]?.id) {
          router.push({
            name: 'UserCourseSectionPage',
            params: {
              courseId: courseId.value,
              sectionId: module.sections[0].id,
            },
          })
        } else {
          toast.error('No sections available for this module')
        }
      }
    }
  } else {
    toast.error('No sections available for this module')
  }
}

const handleSectionClick = (sectionId) => {
  if (sectionId) {
    router.push({
      name: 'UserCourseSectionPage',
      params: {
        courseId: courseId.value,
        sectionId: sectionId,
      },
    })
  } else {
    toast.error('Section ID is required')
  }
}

const fetchModules = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await Axios.get(`/courses/user/${courseId.value}/modules`)

    if (!data.success) {
      throw new Error(data?.message || 'Failed to fetch modules')
    }

    modules.value = data.course

    // initialize accordion state (all collapsed)
    if (modules.value?.modules) {
      expanded.value = Array(modules.value?.modules.length).fill(false)
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch modules'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const toggleAccordion = (index) => {
  expanded.value[index] = !expanded.value[index]
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

    <!-- Modules Accordion Card -->
    <div v-else-if="modules?.modules && modules?.modules.length > 0" class="w-full">
      <div>
        <div class="card-body w-full p-0">
          <!-- modules accordion container -->
          <div class="w-full bg-gray-50 p-6 rounded-lg">
            <h3 v-if="modules" class="text-lg text-gray-500 mb-4">{{ modules.title }} Modules</h3>

            <div
              v-for="(mod, index) in modules.modules"
              :key="mod.id"
              class="accordion-item border-b bg-[#F4F4F4] border-gray-200"
              :class="[
                { 'rounded-t-lg': index === 0 },
                { 'rounded-b-lg border-b-0': index === modules.modules.length - 1 },
              ]"
            >
              <!-- module header -->
              <div
                class="accordion-title flex justify-between items-center cursor-pointer gap-4 p-4"
                @click="toggleAccordion(index)"
              >
                <div class="flex items-center gap-4">
                  <svg
                    class="w-5 h-5 text-gray-600 transition-transform"
                    :class="{ 'rotate-180': expanded[index] }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <h5 class="font-semibold text-black text-xl">{{ mod.title }}</h5>
                </div>
                <div class="flex items-center gap-4">
                  <p class="text-black text-sm whitespace-nowrap">
                    {{ mod.total_sections }} Sections -
                    {{ formatDurationForDisplay(mod.formatted_duration) }} Minutes
                  </p>

                  <!-- Progress Percentage with Circular Indicator -->
                  <div class="flex items-center gap-2">
                    <div class="relative w-12 h-12">
                      <svg class="w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          stroke-width="6"
                          fill="none"
                          class="text-gray-300"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          stroke-width="6"
                          fill="none"
                          :stroke-dasharray="`${2 * Math.PI * 20}`"
                          :stroke-dashoffset="`${2 * Math.PI * 20 * (1 - mod.progress / 100)}`"
                          :class="mod.progress > 0 ? 'text-green-500' : 'text-gray-400'"
                          stroke-linecap="round"
                        />
                      </svg>
                      <span
                        class="absolute inset-0 flex items-center justify-center text-xs font-black"
                        :class="mod.progress > 0 ? 'text-black' : 'text-black'"
                      >
                        {{ mod.progress }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Module Content (Expanded Content) -->
              <div v-if="expanded[index]" class="bg-[#F4F4F4] accordion-desc mt-2 p-4">
                <!-- module description and action button -->
                <div class="flex justify-between items-center pb-4">
                  <p class="w-1/2 text-gray-400">{{ mod.description }}</p>
                  <button
                    v-if="mod.progress == 0"
                    class="bg-[#4BD08B] border border-[#4BD08B] p-3 px-6 rounded-lg text-white font-semibold transition-colors hover:bg-[#4BD08B]/80"
                    @click="handleStartModule(mod.id)"
                  >
                    Start Module
                  </button>
                  <button
                    v-else
                    class="bg-[#46CAEB] border border-[#46CAEB] p-3 px-6 rounded-lg text-white font-semibold transition-colors hover:bg-[#46CAEB]/80"
                    @click="handleContinueModule(mod.id)"
                  >
                    Continue Module
                  </button>
                </div>

                <!-- module sections  -->
                <div
                  v-for="section in mod.sections"
                  :key="section.id"
                  class="flex justify-between items-center gap-4 mt-4"
                >
                  <div class="flex items-center gap-4 w-1/2">
                    <!-- Play Icon -->
                    <svg
                      class="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p class="text-black">{{ section.title }}</p>
                  </div>

                  <div class="flex justify-end items-center gap-8 w-1/2">
                    <!-- to section link -->
                    <a
                      @click.prevent="handleSectionClick(section.id)"
                      class="underline text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap font-semibold"
                    >
                      To Section
                    </a>
                    <!-- File Count -->
                    <p class="text-back text-sm whitespace-nowrap">
                      {{ section.nr_of_files }} File{{ section.nr_of_files !== 1 ? 's' : '' }}
                    </p>

                    <!-- Duration -->
                    <p class="text-gray-500 text-sm whitespace-nowrap">
                      {{ formatDurationForDisplay(section.duration) }}
                    </p>

                    <!-- Completion Checkmark -->
                    <RoundedDoneBlackIcon v-if="section.completed" />
                    <div v-else class="w-3">
                      <p class="text-gray-500 text-sm whitespace-nowrap hidden">Not Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="modules && (!modules?.modules || modules?.modules.length === 0)"
      class="w-full text-center py-8"
    >
      <p class="text-gray-400">No modules available for this course.</p>
    </div>
  </div>
</template>

<style scoped>
.accordion-tite {
  transition: background-color 0.2s;
}
.accordion-title:hover {
  background-color: #f3f4f6;
}
.accordion-desc {
  padding-left: 1rem;
}
.accordion-item:first-child {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.accordion-item:last-child {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
</style>
