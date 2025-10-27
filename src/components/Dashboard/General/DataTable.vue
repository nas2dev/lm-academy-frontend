<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Data Table',
  },
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  pagination: {
    type: Object,
    default: null,
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  searchDebounce: {
    type: Number,
    default: 1000,
  },
})

const emit = defineEmits(['search', 'page-change', 'per-page-change', 'refresh'])

// Local state
const searchTerm = ref('')
const perPage = ref(props.pagination?.per_page || 10)

// Debounced search
let searchTimeout = null
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', searchTerm.value)
  }, props.searchDebounce)
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="flex justify-between items-center mb-6">
        <h6 class="text-lg text-gray-500 font-semibold">{{ title }}</h6>
        <div class="relative">
          <input
            type="text"
            v-model="searchTerm"
            :placeholder="searchPlaceholder"
            @input="handleSearch"
            class="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-full shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg transition-shadow"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error state -->
      <div v-if="error" class="text-center py-8">
        <div class="text-red-500 mb-2">
          {{ error }}
        </div>
        <button
          type="button"
          @click="emit('refresh')"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                class="px-6 py-3 text-left text-sm font-black text-gray-900 uppercase tracking-wider"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="data.length === 0">
              <td :colspan="columns.length" class="px-6 py-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
            <tr v-else v-for="(row, index) in data" :key="row.id || index" class="hover:bg-gray-50">
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
              >
                {{ row[column.key] || 'N/A' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
