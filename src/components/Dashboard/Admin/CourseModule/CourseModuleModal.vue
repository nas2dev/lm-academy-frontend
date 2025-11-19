<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  courseId: {
    type: [String, Number],
    required: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  moduleId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['close', 'success'])

const toast = useToast()
const loading = ref(false)
const formKey = ref(0)
const fetchingModule = ref(false)
const initialValues = ref({
  title: '',
  description: '',
})

const schema = yup.object({
  title: yup.string().required('Title is required').max(255),
  description: yup.string().required('Description is required'),
})

const isEditMode = computed(() => !!props.moduleId)
const buttonText = computed(() => (isEditMode.value ? 'Update' : 'Create'))

const handleBackdropClick = () => {
  if (!loading.value) {
    emit('close')
  }
}
const handleClose = () => {
  if (!loading.value) {
    emit('close')
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-[80%] max-w-5xl mx-4 transform transition-all"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-center relative p-6">
        <h3 class="text-3xl font-bold text-center pr-10 text-gray-900">{{ courseTitle }}</h3>
        <button
          @click="handleClose"
          :disabled="loading || fetchingModule"
          class="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->

      <div class="p-6">
        <!-- Loading state -->
        <div class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8EFA]"></div>
            <p class="text-gray-500 text-sm">Loading module data...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
