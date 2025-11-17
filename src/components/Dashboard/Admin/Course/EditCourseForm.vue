<script setup>
import Axios from '@/utils/axios'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'
import { useToast } from 'vue-toastification'
import { getStorageUrl } from '@/utils/backendHelper'
import ImagePlaceholderIcon from '@/assets/fonts/feather-icons/icons/image.svg?component'
import UploadIcon from '@/assets/fonts/feather-icons/icons/attachment-line-icon.svg?component'
import StatusToggle from '@/components/common/StatusToggle.vue'
import Resumable from 'resumablejs'
import { getBackendBaseUrl } from '@/utils/backendHelper'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
})

const toast = useToast()
const loading = ref(false)
const thumbnailPreview = ref(null)
const existingThumbnailUrl = ref(null)
const initialValues = ref(null)
const formKey = ref(0)
const introVideoPreview = ref(null)

const schema = yup.object({
  title: yup.string().required('Title is required').max(255),
  description: yup.string().required('Description is required'),
  status: yup.number().oneOf([0, 1]).required(),
})

const resolveThumbnailUrl = (path) => getStorageUrl(path, null)

const fetchCourse = async () => {
  try {
    const { data } = await Axios.get(`/courses/${props.courseId}`)
    if (!data.success) throw new Error(data?.message || 'Failed to fetch course')

    const thumbnailUrl = resolveThumbnailUrl(data.course.thumbnail)

    initialValues.value = {
      title: data.course.title || '',
      description: data.course.description || '',
      thumbnail: null,
      removeThumbnail: false,
      intro_video: null,
      remove_intro_video: false,
      status: data.course.status === 'Active' ? 1 : 0,
    }

    existingThumbnailUrl.value = thumbnailUrl
    thumbnailPreview.value = thumbnailUrl
    formKey.value += 1
  } catch (err) {
    toast.error(err.response?.data?.message || err?.message || 'Failed to load course')
  }
}

onMounted(() => {
  fetchCourse()
})

watch(() => props.courseId, fetchCourse)

const onSubmit = async (values, { resetForm }) => {
  if (loading.value) return

  const formData = new FormData()
  formData.append('title', values.title)
  formData.append('description', values.description)
  formData.append('status', values.status)
  formData.append('remove_thumbnail', values.remove_thumbnail ? '1' : '0')

  if (values.thumbnail) {
    formData.append('thumbnail', values.thumbnail)
  }
  // console.log('values', values)
  try {
    loading.value = true
    const { data } = await Axios.post(`/courses/${props.courseId}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (!data.success) {
      throw new Error(data?.message || 'Failed to update course')
    }

    toast.success('Course updated successfully')

    initialValues.value = {
      title: data.course.title || '',
      description: data.course.description || '',
      thumbnail: null,
      removeThumbnail: false,
      intro_video: null,
      remove_intro_video: false,
      status: data.course.status === 'Active' ? 1 : 0,
    }

    if (values.remove_thumbnail) {
      existingThumbnailUrl.value = null
      thumbnailPreview.value = null
    } else {
      existingThumbnailUrl.value = resolveThumbnailUrl(data.course.thumbnail)
      thumbnailPreview.value = existingThumbnailUrl.value
    }

    resetForm({ values: { ...initialValues.value } })
  } catch (err) {
    console.log('err', err?.message)
    toast.error(err.response?.data?.message || err?.message || 'Failed to update course')
  } finally {
    loading.value = false
  }
}

const handleFileChange = (event, setFieldValue, field) => {
  const file = event.target.files[0] || null
  if (!file) {
    event.target.value = ''
    return
  }
  setFieldValue(field, file)
  if (field === 'thumbnail') {
    if (thumbnailPreview.value && thumbnailPreview.value !== existingThumbnailUrl.value) {
      URL.revokeObjectURL(thumbnailPreview.value)
    }

    thumbnailPreview.value = URL.createObjectURL(file)
    setFieldValue('remove_thumbnail', false)
  }
}

const handleRemoveThumbnailToggle = (checked) => {
  if (checked) {
    if (thumbnailPreview.value && thumbnailPreview.value !== existingThumbnailUrl.value) {
      URL.revokeObjectURL(thumbnailPreview.value)
    }
    thumbnailPreview.value = null
  } else {
    thumbnailPreview.value = existingThumbnailUrl.value
  }
}

// Video upload functionality
const videoButtonText = ref('Upload a Video')
const videoFileMessage = ref('')
const video = ref()
const showVideo = ref()
const progress = ref(0)

const uploadVideo = () => {
  if (!video.value) {
    return
  }

  resumable.opts.query = {
    course_id: props.courseId,
  }
  resumable.addFile(video.value)
  resumable.on('fileAdded', () => {
    resumable.upload()
  })
}

// Resumable.js instance
const resumable = new Resumable({
  target: `${getBackendBaseUrl()}/api/courses/${props.courseId}/upload-video`, // your backend chunk upload endpoint
  chunkSize: 4 * 1024 * 1024, // 4MB
  simultaneousUploads: 2, // max concurrent uploads
  testChunks: false, // disable automatic chunk testing
  throttleProgressCallbacks: 1,
  query: {
    course_id: props.courseId,
  },
  headers: {
    Authorization: localStorage.getItem('lm-access-token')
      ? `Bearer ${localStorage.getItem('lm-access-token')}`
      : null,
  },
})

resumable.on('fileProgress', (file) => {
  progress.value = Math.floor(file.progress() * 100)
})

resumable.on('fileSuccess', () => {
  toast.success('Video uploaded successfully')
  resumable.cancel()

  // Rest upload state
  progress.value = 0
  resetVideoInput()

  // Fetch course
  fetchCourse()
})

resumable.on('fileError', (file, message) => {
  console.log('fileError', message)
  toast.error(message || 'Failed to upload video')
  progress.value = 0
  resetVideoInput()
})

const resetVideoInput = () => {
  video.value = null
  showVideo.value = false
  videoButtonText.value = 'Upload a Video'

  const fileInput = document.getElementById('videoFile')
  if (fileInput) {
    fileInput.value = ''
  }
}

const validateVideoFile = (event) => {
  if (event.target.files.length > 0) {
    const fileInput = event.target
    const file = fileInput.files[0]

    if (!file) {
      return
    }

    const fileName = file.name
    videoButtonText.value = fileName

    const fileExtension = fileName.split('.').pop().toLowerCase()
    const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm']

    if (!allowedExtensions.includes(fileExtension)) {
      videoFileMessage.value = 'Only MP4, MOV, AVI, MKV, and WEBM files are allowed'
      return
    }

    const maxSizeInMB = 300 // 300MB
    const fileSizeInMB = file.size / (1024 * 1024) // Convert size to MB

    if (fileSizeInMB > maxSizeInMB) {
      videoFileMessage.value = `The file is too large. Maximum allowed size is: ${maxSizeInMB}MB`
      return
    }

    videoFileMessage.value = ''
    video.value = file

    showVideo.value = URL.createObjectURL(file)
  }
}

const removeVideo = () => {
  video.value = null
  showVideo.value = false
  videoButtonText.value = 'Upload a Video'
  videoFileMessage.value = ''

  const fileInput = document.getElementById('videoFile')
  if (fileInput) {
    fileInput.value = null
  }
}
</script>

<template>
  <Form
    v-if="initialValues"
    :initial-values="initialValues"
    :validation-schema="schema"
    :key="formKey"
    v-slot="{ handleSubmit, setFieldValue }"
  >
    <form @submit.prevent="handleSubmit(onSubmit)" class="space-y-6">
      <div class="space-y-6">
        <div>
          <label class="block text-sm mb-2 text-gray-400">Title</label>
          <Field
            name="title"
            as="input"
            type="text"
            placeholder="Enter course title"
            class="py-3 px-4 block w-full border border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
          />
          <ErrorMessage name="title" class="text-red-500 text-xs mt-1" />
        </div>

        <div>
          <label class="block text-sm mb-2 text-gray-400">Description</label>
          <Field
            name="description"
            as="textarea"
            rows="6"
            placeholder="Write a brief description..."
            class="py-3 px-4 block w-full border border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
          />
          <ErrorMessage name="description" class="text-red-500 text-xs mt-1" />
        </div>

        <div class="flex gap-20">
          <div>
            <label class="block text-sm mb-2 text-gray-400">Thumbnail (preferably 1280x720)</label>
            <div
              class="mb-5 flex items-center justify-center border-2 border-dashed rounded-md min-h-[180px] bg-white"
              :class="thumbnailPreview ? 'border-blue-600' : 'border-gray-200'"
            >
              <img
                v-if="thumbnailPreview"
                :src="thumbnailPreview"
                alt="Thumbnail Preview"
                class="max-h-[170px] max-w-[290px] object-contain"
              />
              <div
                v-else
                class="flex flex-col items-center justify-center text-gray-400 gap-3 py-6"
              >
                <ImagePlaceholderIcon />
                <span class="text-sm">No image selected</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-4 w-full">
              <div class="flex flex-col gap-3 w-full">
                <label
                  class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileChange($event, setFieldValue, 'thumbnail')"
                  />
                  Upload an Image
                  <span class="text-lg leading-none">
                    <UploadIcon />
                  </span>
                </label>

                <button
                  type="button"
                  class="!w-full sm:w-60 inline-flex items-center justify-center px-6 py-2.5 rounded border border-[#FB977D] text-sm font-semibold text-white bg-[#FB977D] hover:bg-white hover:text-[#FB977D] transition disabled:opacity-60"
                  @click="
                    () => {
                      setFieldValue('remove_thumbnail', true)
                      handleRemoveThumbnailToggle(true)
                    }
                  "
                  :disabled="!thumbnailPreview"
                >
                  Delete Image
                </button>
              </div>
              <ErrorMessage name="thumbnail" class="text-red-500 text-xs mt-1" />
            </div>
          </div>

          <!-- Intro Video Section -->
          <div>
            <label class="block text-sm mb-2 text-gray-400">Intro Video (optional)</label>
            <div
              class="mb-5 flex items-center justify-center border-2 border-dashed rounded-md min-h-[180px] max-w-[300px] bg-white"
              :class="introVideoPreview || showVideo ? 'border-blue-400' : 'border-gray-200'"
            >
              <video
                v-if="introVideoPreview || showVideo"
                :src="introVideoPreview || showVideo"
                class="max-h-[170px] max-w-[290px] object-contain w-full rounded-md"
                controls
                muted
              />
              <div
                v-else
                class="w-full sm:w-60 flex flex-col items-center justify-center text-gray-400 gap-3 py-6"
              >
                <UploadIcon class="w-10 h-10" />
                <span class="text-sm">No video selected</span>
              </div>
            </div>

            <div class="flex flex-col items-center gap-3">
              <label
                :class="[
                  '!w-full max-w-[300px] mb-3 sm:w-60 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded border text-sm font-semibold transition',
                  progress > 0
                    ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer',
                ]"
              >
                <Field
                  v-model="video"
                  type="file"
                  accept=".mp4, .mov, .avi, .mkv, .webm"
                  class="hidden"
                  name="videoFile"
                  id="videoFile"
                  :disabled="progress > 0"
                  @change="validateVideoFile"
                />
                {{
                  videoButtonText.length > 20
                    ? videoButtonText.slice(0, 20) + '...'
                    : videoButtonText
                }}
                <span class="leading-none">
                  <UploadIcon />
                </span>
              </label>

              <div class="flex gap-3 !w-full max-w-[300px] sm:w-60">
                <button
                  v-if="showVideo || videoFileMessage"
                  type="button"
                  @click="removeVideo"
                  :disabled="progress > 0"
                  class="flex-1 py-2.5 rounded border border-[#FB977D] text-sm font-semibold text-white bg-[#FB977D] hover:bg-white hover:text-[#FB977D] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#FB977D] disabled:hover:text-white"
                >
                  Remove
                </button>
                <button
                  v-if="showVideo"
                  type="button"
                  :disabled="progress > 0"
                  @click="uploadVideo"
                  class="flex-1 py-2.5 rounded border border-orange-600 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-400 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                >
                  Server Upload
                </button>
              </div>

              <div
                v-if="progress > 0 && progress < 100"
                class="!w-full max-w-[300px] sm:w-60 bg-gray-200 rounded-full h-2 mt-4"
              >
                <div
                  class="h-2 rounded-full"
                  style="
                    background: repeating-linear-gradient(
                      45deg,
                      #5aa0ff,
                      #5aa0ff 10px,
                      #7bb8ff 10px,
                      #7bb8ff 20px
                    );
                  "
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>

              <p v-if="progress > 0 && progress < 100" class="text-sm text-gray-500">
                {{ progress }}%
              </p>

              <p v-if="videoFileMessage" class="text-sm text-red-500 mt-2">
                {{ videoFileMessage }}
              </p>

              <button
                v-if="existingThumbnailUrl && !showVideo && !videoFileMessage && progress === 0"
                type="button"
                class="!w-full sm:w-60 inline-flex items-center justify-center px-6 py-2.5 rounded border border-[#FB977D] text-sm font-semibold text-white bg-[#FB977D] hover:bg-white hover:text-[#FB977D] transition disabled:opacity-60"
                @click="handleDeleteVideo"
              >
                Delete Video
              </button>
            </div>
            <ErrorMessage name="intro_video" class="text-red-500 text-xs mt-1" />
          </div>
        </div>

        <div>
          <Field name="status" v-slot="{ value, setValue }">
            <StatusToggle
              :model-value="value"
              @update:modelValue="setValue"
              active-label="Activate"
              inactive-label="Deactivate"
              :active-value="1"
              :inactive-value="0"
          /></Field>
          <ErrorMessage name="status" class="text-red-500 text-xs mt-1" />
        </div>

        <div class="flex justify-end gap-3">
          <router-link
            :to="{ name: 'AdminCourseViewPage' }"
            class="px-6 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
            >Cancel</router-link
          >
          <button
            type="submit"
            :disabled="loading"
            class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1F8EFA] text-white text-sm font-semibold shadow hover:bg-[#1979d6] transition disabled:opacity-60"
          >
            <span>{{ loading ? 'Updating...' : 'Update Course' }}</span>
          </button>
        </div>
      </div>
    </form>
  </Form>

  <div v-else class="text-sm text-gray-500">Loading course details...</div>
</template>
