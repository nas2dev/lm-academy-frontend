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
const perPage = ref(props.pagination?.per_page || 5)

// Debounced search
let searchTimeout = null
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', searchTerm.value)
  }, props.searchDebounce)
}

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const goToPage = (page) => {
  if (page >= 1 && page <= props.pagination?.last_page) {
    emit('page-change', page)
  }
}

const getPageNumbers = () => {
  if (!props.pagination) return []

  const current = props.pagination.current_page
  const last = props.pagination.last_page
  const pages = []

  if (last <= 7) {
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(last - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < last - 3) pages.push('...')
    pages.push(last)
  }

  return pages
}

const handlePerPageChange = () => {
  emit('per-page-change', perPage.value)
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
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="getNestedValue(row, column.key)"
                >
                  {{ getNestedValue(row, column.key) }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && !error && pagination" class="flex items-center justify-between mt-6">
        <div class="flex items-center space-x-4">
          <span>
            <span>{{ pagination.from || 0 }}</span
            ><span> from </span><span>{{ pagination.total || 0 }}</span>
          </span>

          <select
            v-model="perPage"
            @change="handlePerPageChange"
            class="px-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent per-page-select"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Previous Page Button -->
          <button
            @click="goToPage(pagination.current_page - 1)"
            :disabled="!pagination.prev_page_url"
            class="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed pagination-nav"
          >
            Previous
          </button>

          <template v-for="page in getPageNumbers()" :key="page">
            <button
              v-if="page !== '...'"
              @click="goToPage(page)"
              :class="[
                'w-8 h-8 text-sm font-medium rounded-full flex items-center justify-center',
                page === pagination.current_page
                  ? 'bg-[#46C9EA] text-white shadow-md'
                  : 'text-[#46C9EA] bg-white border border-[#46C9EA] shadow-md hover:bg-[#46C9EA] hover:text-white',
              ]"
            >
              {{ page }}
            </button>
            <span v-else>...</span>
          </template>

          <!-- Next Page Button -->
          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="!pagination.next_page_url"
            class="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed pagination-nav"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.per-page-select {
  padding-right: 1.7rem;
  text-align: center;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

.per-page-select:open {
  text-align: left;
}

.pagination-nav {
  background: none;
  border: none;
  padding: 0;
}
</style>
