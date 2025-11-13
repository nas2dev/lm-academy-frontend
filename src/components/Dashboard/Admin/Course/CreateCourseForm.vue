<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import ImagePlaceholderIcon from '@/assets/fonts/feather-icons/icons/image.svg?component'
import UploadIcon from '@/assets/fonts/feather-icons/icons/attachment-line-icon.svg?component'
import PlusIcon from '@/assets/fonts/feather-icons/icons/add-icon.svg?component'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const thumbnailPreview = ref(null)

const initialValues = {
  title: '',
  description: '',
  thumbnail: null,
}

const schema = yup.object({
  title: yup.string().required('Title is required').max(255),
  description: yup.string().required('Description is required'),
  thumbnail: yup.mixed().nullable(),
})

const onSubmit = async (values, { resetForm }) => {
  if (loading.value) return

  const formData = new FormData()
  formData.append('title', values.title)
  formData.append('description', values.description)
  if (values.thumbnail) formData.append('thumbnail', values.thumbnail)

  try {
    loading.value = true
    const { data } = await Axios.post('/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (!data.success) throw new Error(data?.message || 'Failed to create course')
    toast.success('Course created successfully.')
    resetForm({ values: { ...initialValues } })

    if (thumbnailPreview.value) {
      URL.revokeObjectURL(thumbnailPreview.value)
      thumbnailPreview.value = null
    }
  } catch (err) {
    toast.error(err.response?.data?.message || err?.message || 'Failed to create course')
  } finally {
    loading.value = false
  }
}

const handleFileChange = (event, setFieldValue) => {
  console.log('event', event)
  const file = event.target.files[0] || null
  if (!file) {
    event.target.value = ''
    return
  }
  setFieldValue('thumbnail', file)
  if (thumbnailPreview.value) {
    URL.revokeObjectURL(thumbnailPreview.value)
  }
  thumbnailPreview.value = file ? URL.createObjectURL(file) : null
}
</script>
<template>
  <Form
    :initial-values="initialValues"
    :validation-schema="schema"
    v-slot="{ handleSubmit, setFieldValue }"
  >
    <form @submit.prevent="handleSubmit(onSubmit)" class="space-y-6">
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

      <div>
        <label class="block text-sm mb-2 text-gray-400">Thumbnail (preferably 1280x720)</label>
        <div
          class="mb-5 flex items-center justify-center border-2 border-dashed w-1/2 md:w-1/4 rounded-md min-h-[180px] bg-white"
          :class="thumbnailPreview ? 'border-blue-600' : 'border-gray-200'"
        >
          <img
            v-if="thumbnailPreview"
            :src="thumbnailPreview"
            alt="Thumbnail Preview"
            class="max-h-[170px] object-contain"
          />
          <div v-else class="flex flex-col items-center justify-center text-gray-400 gap-3 py-6">
            <ImagePlaceholderIcon />
            <span class="text-sm">No image selected</span>
          </div>
        </div>
        <label
          class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange($event, setFieldValue)"
          />
          Upload an Image
          <span class="text-lg leading-none">
            <UploadIcon />
          </span>
        </label>
        <ErrorMessage name="thumbnail" class="text-red-500 text-xs mt-1" />
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="loading"
          class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0085DB] text-white text-sm font-semibold shadow hover:bg-[#1979d6] transition disabled:opacity-60"
        >
          <span>{{ loading ? 'Creating...' : 'Create Course' }}</span>
          <PlusIcon />
        </button>
      </div>
    </form>
  </Form>
</template>
