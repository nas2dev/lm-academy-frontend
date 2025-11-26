<script setup>
import { ref, watch, computed } from 'vue'
import FileIcon from '@/assets/fonts/feather-icons/icons/file.svg?component'

const props = defineProps({
  modelValue: {
    type: File,
    default: null,
  },
  existingUrl: {
    type: String,
    default: null,
  },
  error: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'update:error'])

const videoPreview = ref(null)
const videoError = ref('')

watch(
  () => props.modelValue,
  (newFile) => {
    if (newFile) {
      if (videoPreview.value && videoPreview.value !== props.existingUrl) {
        URL.revokeObjectURL(videoPreview.value)
      }
      videoPreview.value = URL.createObjectURL(newFile)
    } else {
      if (videoPreview.value && videoPreview.value !== props.existingUrl) {
        URL.revokeObjectURL(videoPreview.value)
      }
      videoPreview.value = props.existingUrl || null
    }
  },
  { immediate: true },
)

watch(
  () => props.existingUrl,
  (newUrl) => {
    if (!props.modelValue) {
      videoPreview.value = newUrl || null
    }
  },
  { immediate: true },
)

watch(
  () => props.error,
  (newError) => {
    videoError.value = newError
  },
)

const validateVideoFile = (event) => {
  videoError.value = ''
  emit('update:error', '')

  if (!event.target.files || event.target.files.length === 0) {
    if (videoPreview.value && videoPreview.value !== props.existingUrl) {
      URL.revokeObjectURL(videoPreview.value)
    }
    emit('update:modelValue', null)
    videoPreview.value = props.existingUrl || null
    return
  }

  const file = event.target.files[0]
  const fileExtension = file.name.split('.').pop().toLowerCase()
  const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm']

  if (!allowedExtensions.includes(fileExtension)) {
    videoError.value = 'Only MP4, MOV, AVI, MKV, and WEBM files are allowed'
    emit('update:error', videoError.value)
    event.target.value = ''
    if (videoPreview.value && videoPreview.value !== props.existingUrl) {
      URL.revokeObjectURL(videoPreview.value)
    }
    emit('update:modelValue', null)
    videoPreview.value = props.existingUrl || null
    return
  }

  const maxSizeInMB = 1024 // 1GB
  const fileSizeInMB = file.size / (1024 * 1024)

  if (fileSizeInMB > maxSizeInMB) {
    videoError.value = `The file is too large. Maximum allowed size is: ${maxSizeInMB}MB`
    emit('update:error', videoError.value)
    event.target.value = ''
    if (videoPreview.value && videoPreview.value !== props.existingUrl) {
      URL.revokeObjectURL(videoPreview.value)
    }
    emit('update:modelValue', null)
    videoPreview.value = props.existingUrl || null
    return
  }

  // Clear previous preview if exists
  if (videoPreview.value && videoPreview.value !== props.existingUrl) {
    URL.revokeObjectURL(videoPreview.value)
  }

  // Emit the file - the watcher will handle setting the preview
  emit('update:modelValue', file)
  videoPreview.value = URL.createObjectURL(file)
  videoError.value = ''
  emit('update:error', '')
}

const removeVideo = () => {
  if (videoPreview.value && videoPreview.value !== props.existingUrl) {
    URL.revokeObjectURL(videoPreview.value)
  }
  emit('update:modelValue', null)
  videoPreview.value = props.existingUrl || null
  videoError.value = ''
  emit('update:error', '')

  const videoInput = document.getElementById('videoFile')
  if (videoInput) {
    videoInput.value = ''
  }
}
</script>

<template>
  <div
    class="border-2 border-dashed border-blue-500 rounded-xl p-8 flex flex-col items-center justify-end gap-4 min-h-[300px]"
  >
    <div v-if="!videoPreview" class="flex flex-col items-center justify-center gap-4 w-full mb-10">
      <FileIcon />
      <p class="text-sm text-gray-500">No video selected</p>
    </div>
    <div v-else class="flex flex-col items-center gap-4">
      <video
        :src="videoPreview"
        alt="Video Preview"
        class="max-w-[370px] max-h-[320px] object-contain rounded-lg"
        controls
        muted
      />
      <p v-if="existingUrl && videoPreview == existingUrl" class="text-xs text-gray-500">
        Current Video
      </p>
    </div>
    <p v-if="videoError || error" class="text-red-600 text-sm">{{ videoError || error }}</p>
    <div class="flex gap-4">
      <label
        for="videoFile"
        class="px-6 py-2 rounded border border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer text-sm"
        >{{ modelValue || existingUrl ? 'Change Video' : 'Upload Video' }}
      </label>
      <input
        type="file"
        id="videoFile"
        accept=".mp4,.mov,.avi,.mkv,.webm"
        class="hidden"
        :disabled="loading"
        @change="validateVideoFile"
      />
      <button
        v-if="modelValue"
        type="button"
        :disabled="loading || progress > 0"
        class="px-6 py-2 rounded border border-red-500 text-red-500 bg-red-50 hover:bg-red-100 transition text-sm disabled:opacity-50"
        @click="removeVideo"
      >
        Remove
      </button>
    </div>
    <!-- Progress Bar -->
    <div v-if="progress > 0 && progress < 100" class="w-full bg-gray-200 rounded-full h-4 mt-3">
      <div
        class="bg-blue-600 h-4 rounded-full transition-all duration-300"
        :style="{
          width: progress + '%',
          backgroundImage:
            'linear-gradinet(45deg, rgba(255, 255, 255, 0.3 ) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.3) 75%, transparent 75%, transparnet )',
          backgroundSize: '1rem 1rem',
        }"
      ></div>
    </div>
    <p v-if="progress > 0 && progress < 100" class="text-sm text-gray-600 mt-2">
      Uploading: {{ progress }}%
    </p>
  </div>
</template>
