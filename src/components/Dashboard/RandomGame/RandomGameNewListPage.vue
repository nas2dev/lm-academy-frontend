<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import PlusIcon from '@/assets/fonts/feather-icons/icons/add-icon.svg?component'
import PlusCircleIcon from '@/assets/images/icons/plus-circle-icon.png'

const router = useRouter()
const toast = useToast()

const listName = ref('')
const availableUsers = ref([])
const allUsers = ref([]) // Store all users from backend
const selectedRole = ref('') // 'User' or 'Admin'
const emailTextarea = ref('')
const existingLists = ref([])
const validationErrors = ref({})
const loading = ref(false)
const loadingUsers = ref(false)
const loadingLists = ref(false)

// Load existing lists for reference
const loadExistingLists = async () => {
  loadingLists.value = true
  try {
    const response = await Axios.get('/lists')
    if (response.data.success) {
      existingLists.value = response.data.lists.data || []
    }
  } catch (error) {
    console.error('Error loading existing lists:', error)
  } finally {
    loadingLists.value = false
  }
}

// Load all users (for email lookup when adding to list)
const loadAllUsers = async () => {
  try {
    const response = await Axios.get('/users/active-users-for-dropdown')
    if (response.data.success) {
      allUsers.value = response.data.users || []
    }
  } catch (error) {
    console.error('Error loading all users:', error)
    // Don't show error toast here, just log it
    allUsers.value = []
  }
}

// Load users by selected role
const loadUsersByRole = async (role) => {
  if (!role) {
    availableUsers.value = []
    return
  }

  loadingUsers.value = true
  try {
    const response = await Axios.get(`/users/active-users-by-role?role=${role}`)
    if (response.data.success) {
      availableUsers.value = response.data.users || []
    } else {
      throw new Error(response.data.message || 'Failed to load users')
    }
  } catch (error) {
    console.error('Error loading users by role:', error)
    toast.error(error.response?.data?.message || 'Failed to load users')
    availableUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

// Handle role selection change
const handleRoleChange = (event) => {
  selectedRole.value = event.target.value
  loadUsersByRole(selectedRole.value)
}

// Add user to textarea (with plus icon click)
const addUserToTextarea = (user) => {
  // Check if user email already exists in textarea
  const existingEmails = parseEmailsFromTextarea()
  if (existingEmails.includes(user.email.toLowerCase())) {
    toast.warning('User already added to list')
    return
  }

  // Add email to textarea with comma separator
  if (emailTextarea.value.trim()) {
    // Add comma if textarea doesn't end with comma
    const trimmed = emailTextarea.value.trim()
    if (!trimmed.endsWith(',')) {
      emailTextarea.value = trimmed + ', ' + user.email
    } else {
      emailTextarea.value = trimmed + ' ' + user.email
    }
  } else {
    emailTextarea.value = user.email
  }
}

// Parse emails from textarea
const parseEmailsFromTextarea = () => {
  if (!emailTextarea.value.trim()) return []

  const emails = emailTextarea.value
    .split(',')
    .map((email) => email.trim())
    .filter((email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return email && emailRegex.test(email)
    })

  return emails
}

// Get all selected users from textarea
const allSelectedUsers = computed(() => {
  const textareaEmails = parseEmailsFromTextarea()

  // Convert emails to user objects for preview
  return textareaEmails.map((email) => ({
    id: `email-${email}`,
    email: email,
    first_name: '',
    last_name: '',
    source: 'textarea',
  }))
})

// Validate form
const validateForm = () => {
  validationErrors.value = {}

  if (!listName.value.trim()) {
    validationErrors.value.listName = 'List name is required'
    return false
  }

  if (listName.value.trim().length < 2) {
    validationErrors.value.listName = 'List name must be at least 2 characters'
    return false
  }

  if (listName.value.trim().length > 100) {
    validationErrors.value.listName = 'List name must be less than 100 characters'
    return false
  }

  // Check uniqueness (client-side check, backend will also validate)
  const isDuplicate = existingLists.value.some(
    (list) => list.list_name.toLowerCase() === listName.value.trim().toLowerCase(),
  )
  if (isDuplicate) {
    validationErrors.value.listName = 'List name must be unique'
    return false
  }

  return true
}

// Create list
const createList = async () => {
  if (!validateForm()) {
    toast.error('Please fix validation errors')
    return
  }

  loading.value = true
  try {
    // Get emails from textarea
    const textareaEmails = parseEmailsFromTextarea()

    // Find user IDs from emails (for users that exist in the system)
    const userIds = []
    for (const email of textareaEmails) {
      const user = allUsers.value.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (user && user.id) {
        userIds.push(user.id)
      }
    }

    // Create the list with users
    const payload = {
      list_name: listName.value.trim(),
      user_ids: userIds, // Send user IDs for users that exist
      emails: textareaEmails, // Send all emails (backend can handle both)
    }

    console.log('Creating list with payload:', payload)

    const response = await Axios.post('/lists/store', payload)

    if (response.data.success && response.data.list) {
      // Check if there are warnings (invalid/not found emails)
      let successMessage = 'List created successfully!'
      let htmlContent = successMessage

      if (response.data.warnings && response.data.warnings.length > 0) {
        htmlContent = `
          <div>
            <p class="mb-3">${successMessage}</p>
            <div class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-sm font-semibold text-yellow-600 mb-2">Note:</p>
              <ul class="text-xs text-left text-gray-600 space-y-1">
                ${response.data.warnings.map((warning) => `<li>• ${warning}</li>`).join('')}
              </ul>
            </div>
          </div>
        `
      }

      // Show success message with warnings if any
      await Swal.fire({
        title: 'Success',
        html: htmlContent,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-swalConfirm text-white hover:bg-swalConfirm/80',
        },
      })

      // Redirect to lists page
      router.push({ name: 'RandomGameLists' })
    } else {
      throw new Error(response.data.message || 'Failed to create list')
    }
  } catch (error) {
    console.error('Error creating list:', error)

    // Handle validation errors
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors
      let errorHtml =
        '<div class="text-left"><p class="font-semibold mb-2">Validation errors:</p><ul class="text-sm space-y-1">'

      Object.keys(validationErrors).forEach((field) => {
        validationErrors[field].forEach((message) => {
          errorHtml += `<li class="text-red-600">• ${message}</li>`
        })
      })

      errorHtml += '</ul></div>'

      await Swal.fire({
        title: 'Validation Error',
        html: errorHtml,
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-swalCancel text-white hover:bg-swalCancel/80',
        },
      })
    } else {
      // Handle other errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create list'

      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-swalCancel text-white hover:bg-swalCancel/80',
        },
      })
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadExistingLists()
  loadAllUsers() // Load all users for email lookup
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-semibold">Random Game : New List</h1>
      <div class="flex justify-end">
        <router-link
          :to="{ name: 'RandomGameLists' }"
          class="text-[#0085DB] hover:text-blue-700 font-medium"
        >
          Lists
        </router-link>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="flex flex-col gap-3">
          <!-- Instructions -->
          <p class="text-lg text-black my-2">
            Create a new list with users, the name of the list should be unique:
          </p>

          <!-- Check List Names dropdown (for reference) -->
          <div class="relative">
            <p class="text-black font-semibold mb-2">Check List Names:</p>
            <select
              :disabled="loadingLists"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-gray-50"
            >
              <option value="">-- Existing list names (for reference) --</option>
              <option v-for="list in existingLists" :key="list.id" :value="list.id">
                {{ list.list_name }}
              </option>
            </select>
          </div>

          <hr class="mt-5 border-orange-300" />

          <!-- Name of the list input -->
          <div class="flex flex-col gap-2">
            <p class="text-black font-semibold">
              Name of the list <span class="text-red-500">*</span>
            </p>
            <input
              v-model="listName"
              type="text"
              placeholder="e.g. list of 2023 generation..."
              class="w-full px-3 py-2 border rounded-md shadow-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="validationErrors.listName ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="validationErrors.listName" class="text-sm text-red-600">
              {{ validationErrors.listName }}
            </p>
            <p v-else class="text-xs text-gray-500">Must be 2-100 characters and unique</p>
          </div>

          <hr class="mt-5 border-orange-300" />

          <!-- Role and Users selection -->
          <div class="flex flex-col gap-3">
            <p class="text-black font-semibold">Users:</p>

            <!-- Role selector -->
            <div class="relative">
              <select
                v-model="selectedRole"
                @change="handleRoleChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select role --</option>
                <option value="User">Users</option>
                <option value="Admin">Admins</option>
              </select>
            </div>

            <!-- Display users based on selected role -->
            <div v-if="selectedRole && availableUsers.length > 0" class="mt-2">
              <p class="text-sm font-semibold text-black mb-2">
                {{ selectedRole }}s ({{ availableUsers.length }}):
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="(user, index) in availableUsers"
                  :key="user.id"
                  class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-black">{{ index + 1 }}.</span>
                    <span class="text-gray-600">{{ user.email }}</span>
                  </div>
                  <button
                    @click="addUserToTextarea(user)"
                    class="flex items-center justify-center w-7 h-7 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    title="Add user"
                  >
                    <img :src="PlusCircleIcon" alt="Add user" class="w-7 h-7" />
                  </button>
                </div>
              </div>
            </div>
            <div
              v-else-if="selectedRole && !loadingUsers"
              class="text-sm text-gray-500 italic mt-2"
            >
              No {{ selectedRole }}s available.
            </div>
          </div>

          <hr class="mt-5 border-orange-300" />

          <!-- List users textarea -->
          <div class="flex flex-col gap-2">
            <p class="text-black font-semibold">List users:</p>
            <textarea
              v-model="emailTextarea"
              placeholder="List users, separated by commas (e.g., user1@example.com, user2@example.com)"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
            ></textarea>
            <p class="text-xs text-gray-500">
              Enter email addresses separated by commas. These will be added to the list.
            </p>

            <!-- Display parsed emails -->
            <div v-if="parseEmailsFromTextarea().length > 0" class="mt-2">
              <p class="text-sm font-semibold text-black mb-2">
                Emails from textarea ({{ parseEmailsFromTextarea().length }}):
              </p>
              <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(email, index) in parseEmailsFromTextarea()"
                    :key="index"
                    class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {{ email }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview all selected users -->
          <div v-if="allSelectedUsers.length > 0" class="flex flex-col gap-3">
            <p class="text-black font-semibold">
              Preview: All Users to be Added ({{ allSelectedUsers.length }})
            </p>
            <div class="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div
                  v-for="(user, index) in allSelectedUsers"
                  :key="user.id"
                  class="text-sm text-gray-600 flex items-center gap-2"
                >
                  <span class="font-medium">{{ index + 1 }}.</span>
                  <span>{{ user.email }}</span>
                  <span
                    v-if="user.source === 'textarea'"
                    class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded"
                  >
                    Email
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Create button -->
          <div class="flex justify-center mt-6">
            <button
              @click="createList"
              :disabled="loading || !listName.trim()"
              class="px-20 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PlusIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading">Creating...</span>
              <span v-else>Create</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>
