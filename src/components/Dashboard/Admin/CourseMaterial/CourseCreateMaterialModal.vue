<script setup>
import { ref, watch, computed } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import Resumable from 'resumablejs'
import { getBackendBaseUrl, getStorageUrl } from '@/utils/backendHelper'
import ImageUploadSection from './ImageUploadSection.vue'
import FileUploadSection from './FileUploadSection.vue'
import VideoUploadSection from './VideoUploadSection.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  sectionId: {
    type: [String, Number],
    required: true,
  },
  materialId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['close', 'success'])

const toast = useToast()
const loading = ref(false)
const formKey = ref(0)
const fetchingMaterial = ref(false)

const selectedType = ref(null)
const title = ref('')
const content = ref('')
const materialImage = ref(null)
const materialFile = ref(null)
const video = ref(null)

const existingImageUrl = ref(null)
const existingFileUrl = ref(null)
const existingVideoUrl = ref(null)
const imageError = ref('')
const fileError = ref('')
const videoError = ref('')
const progress = ref(0)

const isEditMode = computed(() => !!props.materialId)
const buttonText = computed(() => (isEditMode.value ? 'Update' : 'Add'))

const types = [
  { label: 'Text', value: 'text' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'File', value: 'file' },
]

const initialValues = ref({
  type: null,
  title: '',
  content: '',
  material: null,
})

const schema = computed(() => {
  const baseSchema = {
    title: yup.string().required('Title is required').min(2).max(255),
  }

  // In edit mode, type is not required (it's hidden)
  if (!isEditMode.value) {
    baseSchema.type = yup.string().required('Type is required')
  }

  if (selectedType.value === 'text') {
    baseSchema.content = yup.string().nullable()
  }

  return yup.object(baseSchema)
})

const resetForm = () => {
  selectedType.value = null
  title.value = ''
  content.value = ''
  materialImage.value = null
  materialFile.value = null
  video.value = null
  existingImageUrl.value = null
  existingFileUrl.value = null
  existingVideoUrl.value = null
  imageError.value = ''
  fileError.value = ''
  videoError.value = ''
  progress.value = 0
  formKey.value++
}

// Watch for modal open and materialId change to fetch material data
watch(
  () => [props.isOpen, props.materialId],
  ([isOpen, materialId]) => {
    if (isOpen && materialId) {
      // fetchMaterial()
    } else {
      resetForm()
    }
  },
)

const fetchMaterial = async () => {
  console.log('fetchingMaterial')
}

const validateBeforeSubmit = () => {
  // In edit mode, files are optional (can keep existing or replace)
  if (isEditMode.value) {
    // For edit mode, we only need title (and content for text)
    // For video, we can update just the title without changing the video
    return true
  }

  // For create mode, files are required
  if (selectedType.value === 'image' && !materialImage.value) {
    imageError.value = 'Please select an image'
    return false
  }
  if (selectedType.value === 'video' && !video.value) {
    videoError.value = 'Please select a video'
    return false
  }
  if (selectedType.value === 'file' && !materialFile.value) {
    fileError.value = 'Please select a file'
    return false
  }

  return true
}

watch(selectedType, () => {
  imageError.value = ''
  fileError.value = ''
  videoError.value = ''
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.materialId) {
      fetchMaterial()
    } else if (newVal && !props.materialId) {
      resetForm()
    }
  },
)

const handleBackdropClick = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const handleClose = () => {
  handleBackdropClick()
}

const onSubmit = async (values, { resetForm: resetFormHandler }) => {
  if (loading.value || progress.value > 0) return

  // Handle video upload separately (for both create and update)
  // But only if a new file is selected
  if (selectedType.value === 'video' && video.value) {
    if (!validateBeforeSubmit()) {
      return
    }
    uploadVideo()
    return
  }

  // For video in edit mode without new file, update just the title via regular API
  // TODO: Implement this method above

  if (!validateBeforeSubmit()) {
    return
  }

  try {
    loading.value = true

    const formData = new FormData()

    if (isEditMode.value) {
      // Update mode
    } else {
      // Create mode
      formData.append('section_id', props.sectionId)
      formData.append('title', values.title)
      formData.append('type', selectedType.value)

      if (selectedType.value === 'text') {
        formData.append('content', content.value || '')
      } else if (selectedType.value === 'image' && materialImage.value) {
        formData.append('material', materialImage.value)
      } else if (selectedType.value === 'file' && materialFile.value) {
        formData.append('material', materialFile.value)
      }

      const { data } = await Axios.post('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!data.success) {
        throw new Error(data?.message || 'Failed to create material')
      }

      toast.success('Material created successfully')
      resetForm()
      resetFormHandler()

      // The API returns course_material, not material
      const materialData = data.course_material || null

      if (materialData && materialData.id) {
        emit('success', materialData)
      } else {
        // If material is not in response, emit null to trigger refresh
        emit('success', null)
      }
      emit('close')
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.message || `Failed to ${isEditMode.value ? 'update' : 'create'} material`
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const uploadVideo = () => {
  console.log('uploading video')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 !mt-0"
    @click="handleBackdropClick"
  >
    <div
      @click.stop
      class="bg-white rounded-lg shadow-xl w-[80%] max-w-5xl mx-4 transform transition-all max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex items-center justify-center relative p-6 border-b border-gray-200">
        <h3 class="text-2xl font-bold text-gray-900 text-center pr-10">
          {{ isEditMode ? 'Update Material' : 'Add New Material' }}
        </h3>
        <div v-if="fetchingMaterial" class="absolute left-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
        <button
          @click="handleClose"
          :disabled="loading"
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
        <Form
          :key="formKey"
          :initial-values="initialValues"
          :validation-schema="schema"
          v-slot="{ handleSubmit }"
        >
          <form @submit.prevent="handleSubmit(onSubmit)" class="space-y-6">
            <!-- Type Selection -->
            <div v-if="!isEditMode">
              <label class="block text-sm mb-2 text-gray-700 font-semibold">Type</label>
              <Field name="type" v-slot="{ field }" v-model="selectedType">
                <select
                  v-bind="field"
                  v-model="selectedType"
                  :disabled="loading"
                  class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0 disabled:opacity-50"
                >
                  <option value="">Select a type</option>
                  <option v-for="type in types" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </Field>
              <ErrorMessage name="type" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm mb-2 text-gray-700 font-semibold">Title</label>
              <Field
                name="title"
                v-model="title"
                as="input"
                type="text"
                :disabled="loading"
                placeholder="Enter title"
                class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0 disabled:opacity-50"
              />
              <ErrorMessage name="title" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Content -->
            <div v-if="selectedType === 'text'">
              <label class="block text-sm mb-2 text-gray-700 font-semibold">Description</label>
              <Field
                name="content"
                v-model="content"
                as="textarea"
                rows="4"
                :disabled="loading"
                placeholder="Enter content description"
                class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0 disabled:opacity-50"
              />
              <ErrorMessage name="content" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Image Upload Section -->
            <ImageUploadSection
              v-if="selectedType === 'image'"
              v-model="materialImage"
              :existing-url="existingImageUrl"
              v-model:error="imageError"
              :loading="loading"
            />

            <!-- File Upload Section -->
            <FileUploadSection
              v-if="selectedType === 'file'"
              v-model="materialFile"
              :existing-url="existingFileUrl"
              v-model:error="fileError"
              :loading="loading"
            />

            <!-- Video Upload Section -->
            <VideoUploadSection
              v-if="selectedType === 'video'"
              v-model="video"
              :existing-url="existingVideoUrl"
              v-model:error="videoError"
              :loading="loading"
              :progress="progress"
            />

            <!-- Footer Buttons -->
            <div class="flex justify-end items-center pt-4 gap-4">
              <button
                type="submit"
                :disabled="
                  loading || (!isEditMode && !selectedType) || progress > 0 || fetchingMaterial
                "
                class="px-8 py-2 rounded bg-green-500 bg-opacity-70 text-white font-medium hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{
                  loading
                    ? isEditMode
                      ? 'Updating...'
                      : 'Adding...'
                    : progress > 0
                      ? 'Uploading...'
                      : buttonText
                }}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  </div>
</template>
