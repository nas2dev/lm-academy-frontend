<script setup>
import { computed } from 'vue'
import EditIcon from '@/assets/fonts/feather-icons/icons/edit-icon.svg?component'
import TrashIcon from '@/assets/fonts/feather-icons/icons/delete-icon.svg?component'
import dragArrowUpIcon from '@/assets/images/dragarrowup.png'
import dragArrowDownIcon from '@/assets/images/dragarrowdown.png'
import dragIcon from '@/assets/images/dragicon.png'
import { getStorageUrl } from '@/utils/backendHelper'

const props = defineProps({
  material: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  totalMaterials: {
    type: Number,
    required: true,
  },
  draggedIndex: {
    type: Number,
    default: null,
  },
  draggedOverIndex: {
    type: Number,
    default: null,
  },
})

const emits = defineEmits([
  'update',
  'delete',
  'moveUp',
  'moveDown',
  'dragStart',
  'dragOver',
  'dragLeave',
  'drop',
  'dragEnd',
])

const handleDragOver = (event) => {
  emits('dragOver', event, props.index)
}

const handleDragLeave = () => {
  emits('dragLeave')
}

const handleDrop = (event) => {
  emits('drop', event, props.index)
}

const handleMoveUp = () => {
  emits('moveUp', props.index)
}

const handleMoveDown = () => {
  emits('moveDown', props.index)
}

const handleDragStart = () => {
  emits('dragStart', props.index)
}

const handleDragEnd = () => {
  emits('dragEnd', props.index)
}

const materialMediaUrl = computed(() => {
  if (!props.material?.material_url) return null
  return getStorageUrl(props.material.material_url, null)
})

const handleUpdate = () => {
  emits('update', props.material)
}

const handleDelete = () => {
  emits('delete', props.material)
}
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6 transition-all material-item"
    :class="{
      'opacity-50': draggedIndex === index,
      'border-blue-500 border-2': draggedOverIndex === index && draggedIndex !== index,
    }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="flex gap-8">
      <!-- Drag and Move Buttons -->
      <div class="flex flex-col justify-between items-center gap-8">
        <button
          type="button"
          @click="handleMoveUp"
          :disabled="index === 0"
          class="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition"
          :title="index === 0 ? 'Already at the top' : 'Move up'"
        >
          <img :src="dragArrowUpIcon" alt="Drag Arrow Up" class="w-6 h-6" />
        </button>
        <img
          :src="dragIcon"
          alt="Drag Icon"
          class="cursor-grab w-8 h-8 hover:opacity-80 transition"
          draggable="true"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
        />
        <button
          type="button"
          @click="handleMoveDown"
          :disabled="index === totalMaterials - 1"
          class="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition"
          :title="index === totalMaterials - 1 ? 'Already at the bottom' : 'Move down'"
        >
          <img :src="dragArrowDownIcon" alt="Drag Arrow Down" class="w-6 h-6" />
        </button>
      </div>

      <!-- Material Content -->
      <div class="flex-1 space-y-5">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700 tracking-wide">Material Title</label>
          <input
            type="text"
            :value="material.title"
            readonly
            class="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 bg-gray-50 focus:outline-none"
          />
          <!-- {{ material }} -->
        </div>

        <div
          class="border-2 border-dashed rounded-xl min-h-[220px] flex bg-gray-50 p-6"
          :class="{
            'justify-center items-center': material.type !== 'text',
            'justify-start items-start': material.type === 'text',
          }"
        >
          <template v-if="material.type === 'text'">
            <p class="max-w-4xl text-gray-700 leading-relaxed whitespace-pre-line text-left">
              {{ material.content || 'No content' }}
            </p>
          </template>
          <template v-else-if="material.type === 'image'">
            <img
              :src="materialMediaUrl"
              :alt="material.title"
              class="max-h-[320px] object-contain rounded-lg shadow-sm"
            />
          </template>
          <template v-else-if="material.type === 'video'">
            <video
              :src="materialMediaUrl"
              controls
              class="max-h-[320px] w-full rounded-lg shadow-sm"
              bg-black
            ></video>
          </template>

          <template v-else-if="material.type === 'file' && materialMediaUrl">
            <div class="flex flex-col items-center gap-3 text-gray-600">
              <div
                class="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-base font-semibold"
              >
                {{ (material.extension || 'FILE').toUpperCase() }}
              </div>
              <a
                :href="materialMediaUrl"
                target="_blank"
                class="text-blue-600 text-sm font-medium hover:underline"
              >
                Open file
              </a>
            </div>
          </template>
          <template v-else>
            <span class="text-gray-400 text-sm">No preview available</span>
          </template>
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
          <span v-if="material.created_by">
            Created by:
            <span class="text-gray-900 font-medium"> {{ material.created_by }}</span>
          </span>
          <span class="relative group">
            Last updated:
            <span class="text-gray-900 font-medium" :class="{ 'cursor-help': material.updated_by }">
              {{ material.updated_at }}
            </span>
            <span
              v-if="material.updated_by"
              class="absolute left-0 bottom-full mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
            >
              Updated by: {{ material.updated_by }}
              <span
                class="absolute top-full left-4 border-4 border-transparent border-t-gray-900"
              ></span>
            </span>
          </span>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 transition text-sm"
            @click="handleUpdate"
          >
            <EditIcon class="w-4 h-4" /><span>Update</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500 text-red-500 bg-white hover:bg-red-50 transition text-sm"
            @click="handleDelete"
          >
            <TrashIcon class="w-5 h-5" /><span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
