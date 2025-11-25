<script setup>
import { ref, watch } from 'vue'
import ImagePlaceholderIcon from '@/assets/fonts/feather-icons/icons/image.svg?component'

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

const imagePreview = ref(null)
const imageError = ref('')

watch(
  () => props.modelValue,
  (newFile) => {
    if (newFile) {
      if (imagePreview.value && imagePreview.value !== props.existingUrl) {
        URL.revokeObjectURL(imagePreview.value)
      }
      imagePreview.value = URL.createObjectURL(newFile)
    } else {
      if (imagePreview.value && imagePreview.value !== props.existingUrl) {
        URL.revokeObjectURL(imagePreview.value)
      }
      imagePreview.value = props.existingUrl || null
    }
  },
  { immediate: true },
)

watch(
  () => props.existingUrl,
  (newUrl) => {
    if (!props.modelValue) {
      imagePreview.value = newUrl || null
    }
  },
  { immediate: true },
)

watch(
  () => props.error,
  (newError) => {
    imageError.value = newError
  },
)

const validateImageFile = (event) => {
  imageError.value = ''
  emit('update:error', '')

  if (!event.target.files || event.target.files.length === 0) {
    emit('update:modelValue', null)
    return
  }

  const file = event.target.files[0]
  const fileExtension = file.name.split('.').pop().toLowerCase()
  const allowedExtensions = ['jpeg', 'jpg', 'png', 'svg', 'webp']

  if (!allowedExtensions.includes(fileExtension)) {
    imageError.value = 'Only JPEG, JPG, PNG, SVG, and WEBP files are allowed'
    emit('update:error', imageError.value)
    event.target.value = ''
    emit('update:modelValue', null)
    return
  }

  const maxSizeInMB = 4 // 4MB
  const fileSizeInMB = file.size / (1024 * 1024)

  if (fileSizeInMB > maxSizeInMB) {
    imageError.value = `The file is too large. Maximum allowed size is: ${maxSizeInMB}MB`
    emit('update:error', imageError.value)
    event.target.value = ''
    emit('update:modelValue', null)
    return
  }

  // Emit the file - the watcher will handle setting the preview
  emit('update:modelValue', file)
  imageError.value = ''
  emit('update:error', '')
}

const removeImage = () => {
  if (imagePreview.value && imagePreview.value !== props.existingUrl) {
    URL.revokeObjectURL(imagePreview.value)
  }
  emit('update:modelValue', null)
  imagePreview.value = props.existingUrl || null
  imageError.value = ''
  emit('update:error', '')

  const fileInput = document.getElementById('imageFile')
  if (fileInput) {
    fileInput.value = ''
  }
}
</script>

<template>
  <div
    class="border-2 border-dashed border-blue-500 rounded-xl p-8 flex flex-col items-center justify-end gap-4 min-h-[300px]"
  >
    <div v-if="!imagePreview" class="flex flex-col items-center justify-center gap-4 w-full mb-10">
      <ImagePlaceholderIcon />
      <p class="text-sm text-gray-500">No image selected</p>
    </div>
    <div v-else class="flex flex-col items-center gap-4">
      <img
        :src="imagePreview"
        alt="Image Preview"
        class="max-w-[370px] max-h-[320px] object-contain rounded-lg"
      />
      <p v-if="existingUrl && imagePreview == existingUrl" class="text-xs text-gray-500">
        Current Image
      </p>
    </div>
    <p v-if="imageError || error" class="text-red-600 text-sm">{{ imageError || error }}</p>
    <div class="flex gap-4">
      <label
        for="imageFile"
        class="px-6 py-2 rounded border border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer text-sm"
        >{{ modelValue || existingUrl ? 'Change Image' : 'Upload Image' }}
      </label>
      <input
        type="file"
        id="imageFile"
        accept=".jpeg,.jpg,.png,.svg,.webp"
        class="hidden"
        :disabled="loading"
        @change="validateImageFile"
      />
      <button
        v-if="modelValue"
        type="button"
        :disabled="loading"
        class="px-6 py-2 rounded border border-red-500 text-red-500 bg-red-50 hover:bg-red-100 transition text-sm disabled:opacity-50"
        @click="removeImage"
      >
        Remove
      </button>
    </div>
  </div>
</template>
