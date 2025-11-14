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
  console.log('values', values)
  resetForm({ values: { ...initialValues } })
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
                class="max-h-[170px] max-w-[300px] object-contain"
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
                    @change="handleFileChange($event, setFieldValue)"
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
                      console.log('remove thumbnail')
                    }
                  "
                >
                  Delete Image
                </button>
              </div>
              <ErrorMessage name="thumbnail" class="text-red-500 text-xs mt-1" />
            </div>
          </div>

          <div>
            <label class="block text-sm mb-2 text-gray-400">Intro Video (optional)</label>
            <div
              class="mb-5 flex items-center justify-center border-2 border-dashed rounded-md min-h-[180px] bg-white"
              :class="introVideoPreview ? 'border-blue-400' : 'border-gray-200'"
            >
              <video
                v-if="introVideoPreview"
                :src="introVideoPreview"
                class="max-h-[170px] max-w-[300px] object-contain w-full rounded-md"
                controls
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
                class="!w-full sm:w-60 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <input type="file" accept="video/*" class="hidden" />
                Upload a Video
                <span class="leading-none">
                  <UploadIcon />
                </span>
              </label>

              <button
                type="button"
                class="!w-full sm:w-60 inline-flex items-center justify-center px-6 py-2.5 rounded border border-[#FB977D] text-sm font-semibold text-white bg-[#FB977D] hover:bg-white hover:text-[#FB977D] transition disabled:opacity-60"
                :disabled="!introVideoPreview"
              >
                Delete Video
              </button>
            </div>
            <!-- <ErrorMessage name="intro_video" class="text-red-500 text-xs mt-1" /> -->
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
