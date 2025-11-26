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
})

const emit = defineEmits(['update:modelValue', 'update:error'])

const filePreview = ref(null)
const fileError = ref('')
const fileExtension = ref('')

const getFileIconText = computed(() => {
  if (fileExtension.value === 'pdf') {
    return 'PDF'
  } else if (fileExtension.value === 'doc' || fileExtension.value === 'docx') {
    return 'DOC'
  } else if (fileExtension.value === 'xls' || fileExtension.value === 'xlsx') {
    return 'XLS'
  }

  return 'FILE'
})

watch(
  () => props.modelValue,
  (newFile) => {
    if (newFile) {
      if (filePreview.value && filePreview.value !== props.existingUrl) {
        URL.revokeObjectURL(filePreview.value)
      }
      filePreview.value = URL.createObjectURL(newFile)
      fileExtension.value = newFile.name.split('.').pop().toLowerCase()
    } else {
      if (filePreview.value && filePreview.value !== props.existingUrl) {
        URL.revokeObjectURL(filePreview.value)
      }
      filePreview.value = props.existingUrl || null
      fileExtension.value = props.existingUrl
        ? props.existingUrl.split('.').pop().toLowerCase()
        : ''
    }
  },
  { immediate: true },
)

watch(
  () => props.existingUrl,
  (newUrl) => {
    if (!props.modelValue) {
      filePreview.value = newUrl || null
      fileExtension.value = newUrl ? newUrl.split('.').pop().toLowerCase() : ''
    }
  },
  { immediate: true },
)

watch(
  () => props.error,
  (newError) => {
    fileError.value = newError
  },
)

const validateFileInput = (event) => {
  fileError.value = ''
  emit('update:error', '')

  if (!event.target.files || event.target.files.length === 0) {
    if (filePreview.value && filePreview.value !== props.existingUrl) {
      URL.revokeObjectURL(filePreview.value)
    }
    emit('update:modelValue', null)
    filePreview.value = props.existingUrl || null
    fileExtension.value = props.existingUrl ? props.existingUrl.split('.').pop().toLowerCase() : ''
    return
  }

  const file = event.target.files[0]
  const ext = file.name.split('.').pop().toLowerCase()
  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx']

  if (!allowedExtensions.includes(ext)) {
    fileError.value = 'Only PDF, DOC, DOCX, XLS, and XLSX files are allowed'
    emit('update:error', fileError.value)
    event.target.value = ''
    if (filePreview.value && filePreview.value !== props.existingUrl) {
      URL.revokeObjectURL(filePreview.value)
    }
    emit('update:modelValue', null)
    filePreview.value = props.existingUrl || null
    fileExtension.value = props.existingUrl ? props.existingUrl.split('.').pop().toLowerCase() : ''
    return
  }

  const maxSizeInMB = 10 // 10MB
  const fileSizeInMB = file.size / (1024 * 1024)

  if (fileSizeInMB > maxSizeInMB) {
    fileError.value = `The file is too large. Maximum allowed size is: ${maxSizeInMB}MB`
    emit('update:error', fileError.value)
    event.target.value = ''
    if (filePreview.value && filePreview.value !== props.existingUrl) {
      URL.revokeObjectURL(filePreview.value)
    }
    emit('update:modelValue', null)
    filePreview.value = props.existingUrl || null
    fileExtension.value = props.existingUrl ? props.existingUrl.split('.').pop().toLowerCase() : ''
    return
  }

  // Clear previous preview if exists
  if (filePreview.value && filePreview.value !== props.existingUrl) {
    URL.revokeObjectURL(filePreview.value)
  }

  // Emit the file - the watcher will handle setting the preview
  emit('update:modelValue', file)
  fileExtension.value = ext
  filePreview.value = URL.createObjectURL(file)
  fileError.value = ''
  emit('update:error', '')
}

const removeFile = () => {
  if (filePreview.value && filePreview.value !== props.existingUrl) {
    URL.revokeObjectURL(filePreview.value)
  }
  emit('update:modelValue', null)
  filePreview.value = props.existingUrl || null
  fileExtension.value = props.existingUrl ? props.existingUrl.split('.').pop().toLowerCase() : ''
  fileError.value = ''
  emit('update:error', '')

  const fileInput = document.getElementById('documentFile')
  if (fileInput) {
    fileInput.value = ''
  }
}
</script>

<template>
  <div
    class="border-2 border-dashed border-blue-500 rounded-xl p-8 flex flex-col items-center justify-end gap-4 min-h-[300px]"
  >
    <div v-if="!filePreview" class="flex flex-col items-center justify-center gap-4 w-full mb-10">
      <FileIcon />
      <p class="text-sm text-gray-500">No file selected</p>
    </div>
    <div v-else class="flex flex-col items-center gap-4">
      <div
        class="w-24 h-24 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700"
      >
        {{ getFileIconText }}
      </div>
      <p class="text-sm text-gray-700 font-medium">
        {{ modelValue?.name || (existingUrl ? 'Current File' : 'No file') }}
      </p>
      <p v-if="existingUrl && !modelValue" class="text-xs text-gray-500">
        <a :href="existingUrl" target="_blank" class="text-blue-600 :hover:underline"
          >View current file</a
        >
      </p>
    </div>
    <p v-if="fileError || error" class="text-red-600 text-sm">{{ fileError || error }}</p>
    <div class="flex gap-4">
      <label
        for="documentFile"
        class="px-6 py-2 rounded border border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer text-sm"
        :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >{{ modelValue || existingUrl ? 'Change File' : 'Upload File' }}
      </label>
      <input
        type="file"
        id="documentFile"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        class="hidden"
        :disabled="loading"
        @change="validateFileInput"
      />
      <button
        v-if="modelValue"
        type="button"
        :disabled="loading"
        class="px-6 py-2 rounded border border-red-500 text-red-500 bg-red-50 hover:bg-red-100 transition text-sm disabled:opacity-50"
        @click="removeFile"
      >
        Remove
      </button>
    </div>
  </div>
</template>
