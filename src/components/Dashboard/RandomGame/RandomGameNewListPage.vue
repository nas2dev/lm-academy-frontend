<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import PlusIcon from '@/assets/fonts/feather-icons/icons/add-icon.svg?component'
import MinusIcon from '@/assets/fonts/feather-icons/icons/minus.svg?component'

const router = useRouter()
const toast = useToast()

const listName = ref('')
const selectedUsers = ref([])
const availableUsers = ref([])
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

// Load available users
const loadAvailableUsers = async () => {
  loadingUsers.value = true
  try {
    const response = await Axios.get('/users/active-users-for-dropdown')
    if (response.data.success) {
      availableUsers.value = response.data.users || []
    } else {
      throw new Error(response.data.message || 'Failed to load users')
    }
  } catch (error) {
    console.error('Error loading users:', error)
    toast.error(error.response?.data?.message || 'Failed to load users')
    availableUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

// Add user from dropdown
const addUserFromDropdown = (userId) => {
  const user = availableUsers.value.find((u) => u.id === userId)
  if (user && !selectedUsers.value.find((u) => u.id === userId)) {
    selectedUsers.value.push({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      source: 'dropdown',
    })
  }
}

// Remove user from selection
const removeUserFromSelection = (userId) => {
  selectedUsers.value = selectedUsers.value.filter((u) => u.id !== userId)
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

// Get all selected users (dropdown + textarea)
const allSelectedUsers = computed(() => {
  const dropdownUsers = selectedUsers.value.filter((u) => u.source === 'dropdown')
  const textareaEmails = parseEmailsFromTextarea()

  // Combine and remove duplicates
  const allUsers = [...dropdownUsers]
  const seenEmails = new Set(dropdownUsers.map((u) => u.email.toLowerCase()))

  textareaEmails.forEach((email) => {
    if (!seenEmails.has(email.toLowerCase())) {
      allUsers.push({
        id: `email-${email}`,
        email: email,
        first_name: '',
        last_name: '',
        source: 'textarea',
      })
      seenEmails.add(email.toLowerCase())
    }
  })

  return allUsers
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

// Add users to new list (after creation)
const addUsersToNewList = async (listId, userIds) => {
  if (userIds.length === 0) return

  try {
    // Add users one by one (or batch if backend supports it)
    for (const userId of userIds) {
      await Axios.post(`/lists/${listId}/add-users`, {
        user_id: userId,
      })
    }
  } catch (error) {
    console.error('Error adding users to list:', error)
    // Don't throw - list is created, users can be added later
    toast.warning(
      'List created but some users could not be added. You can add them manually later.',
    )
  }
}

// Create list
const createList = async () => {
  if (!validateForm()) {
    toast.error('Please fix validation errors')
    return
  }

  loading.value = true
  try {
    // Create the list
    const response = await Axios.post('/lists/store', {
      list_name: listName.value.trim(),
    })

    if (response.data.success && response.data.list) {
      const newListId = response.data.list.id

      // Add users from dropdown selection
      const dropdownUserIds = selectedUsers.value
        .filter((u) => u.source === 'dropdown')
        .map((u) => u.id)

      if (dropdownUserIds.length > 0) {
        await addUsersToNewList(newListId, dropdownUserIds)
      }

      // Show success message
      await Swal.fire({
        title: 'Success',
        text: 'List created successfully!',
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
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadExistingLists()
  loadAvailableUsers()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">Random Game : New List</h2>
      <router-link
        :to="{ name: 'RandomGameLists' }"
        class="text-blue-600 hover:text-blue-800 font-medium"
      >
        Lists
      </router-link>
    </div>

    <!-- Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-gray-700">
        Create a new list with users, the name of the list should be unique:
      </p>
    </div>

    <!-- Check List Names dropdown (for reference) -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2"> Check List Names: </label>
      <select
        :disabled="loadingLists"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
      >
        <option value="">-- Existing list names (for reference) --</option>
        <option v-for="list in existingLists" :key="list.id" :value="list.id">
          {{ list.list_name }}
        </option>
      </select>
    </div>

    <!-- Name of the list input -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Name of the list <span class="text-red-500">*</span>
      </label>
      <input
        v-model="listName"
        type="text"
        placeholder="e.g. list of 2023 generation..."
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="validationErrors.listName ? 'border-red-500' : 'border-gray-300'"
      />
      <p v-if="validationErrors.listName" class="mt-1 text-sm text-red-600">
        {{ validationErrors.listName }}
      </p>
      <p v-else class="mt-1 text-xs text-gray-500">Must be 2-100 characters and unique</p>
    </div>

    <!-- Users dropdown -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2"> Users: </label>
      <select
        @change="
          addUserFromDropdown($event.target.value)
          $event.target.value = ''
        "
        :disabled="loadingUsers"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">-- Select a user to add --</option>
        <option
          v-for="user in availableUsers"
          :key="user.id"
          :value="user.id"
          :disabled="selectedUsers.some((u) => u.id === user.id)"
        >
          {{ user.email }} ({{ user.first_name }} {{ user.last_name }})
        </option>
      </select>

      <!-- Display selected users -->
      <div v-if="selectedUsers.length > 0" class="mt-3">
        <p class="text-sm font-medium text-gray-700 mb-2">Selected Users:</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div
            v-for="user in selectedUsers"
            :key="user.id"
            class="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <span class="text-sm text-gray-600">{{ user.email }}</span>
            <button
              @click="removeUserFromSelection(user.id)"
              class="text-red-600 hover:text-red-800"
              title="Remove"
            >
              <MinusIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List users textarea -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2"> List users </label>
      <textarea
        v-model="emailTextarea"
        placeholder="List users, separated by commas (e.g., user1@example.com, user2@example.com)"
        rows="4"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      ></textarea>
      <p class="mt-1 text-xs text-gray-500">
        Enter email addresses separated by commas. These will be added to the list.
      </p>

      <!-- Display parsed emails -->
      <div v-if="parseEmailsFromTextarea().length > 0" class="mt-3">
        <p class="text-sm font-medium text-gray-700 mb-2">
          Emails from textarea ({{ parseEmailsFromTextarea().length }}):
        </p>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
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
    <div v-if="allSelectedUsers.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold mb-3">
        Preview: All Users to be Added ({{ allSelectedUsers.length }})
      </h3>
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
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
    <div class="flex justify-center">
      <button
        @click="createList"
        :disabled="loading || !listName.trim()"
        class="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <PlusIcon v-if="!loading" class="w-5 h-5" />
        <span v-if="loading">Creating...</span>
        <span v-else>Create</span>
      </button>
    </div>
  </div>
</template>
