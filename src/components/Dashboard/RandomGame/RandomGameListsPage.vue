<script setup>
import { ref, onMounted } from 'vue'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import TrashIcon from '@/assets/fonts/feather-icons/icons/trash-2.svg?component'
import PlusCircleIcon from '@/assets/images/icons/plus-circle-icon.png'
import MinusCircleIcon from '@/assets/images/icons/minus-circle-icon.png'

const toast = useToast()

const lists = ref([])
const selectedListId = ref(null)
const selectedList = ref(null)
const availableUsers = ref([])
const listName = ref('')
const loading = ref(false)
const loadingLists = ref(false)
const loadingUsers = ref(false)

// Load all lists
const loadLists = async () => {
  loadingLists.value = true
  try {
    const response = await Axios.get('/lists')
    if (response.data.success) {
      lists.value = response.data.lists.data || []
    } else {
      throw new Error(response.data.message || 'Failed to load lists')
    }
  } catch (error) {
    console.error('Error loading lists:', error)
    toast.error(error.response?.data?.message || 'Failed to load lists')
  } finally {
    loadingLists.value = false
  }
}

// Handle list selection change
const onListChange = async (listId) => {
  if (!listId) {
    selectedList.value = null
    listName.value = ''
    availableUsers.value = []
    return
  }

  await loadListDetails(listId)
  await loadAvailableUsers(listId)
}

// Load list details and users
const loadListDetails = async (listId) => {
  loading.value = true
  try {
    const response = await Axios.get(`/lists/${listId}/users`)
    if (response.data.success) {
      selectedList.value = response.data.users_list
      listName.value = response.data.users_list?.list_name || ''
    } else {
      throw new Error(response.data.message || 'Failed to load list details')
    }
  } catch (error) {
    console.error('Error loading list details:', error)
    toast.error(error.response?.data?.message || 'Failed to load list details')
    selectedList.value = null
    listName.value = ''
  } finally {
    loading.value = false
  }
}

// Load available users (not in list)
const loadAvailableUsers = async (listId) => {
  loadingUsers.value = true
  try {
    const response = await Axios.get(`/lists/${listId}/available-users`)
    if (response.data.success) {
      availableUsers.value = response.data.available_users || []
    } else {
      throw new Error(response.data.message || 'Failed to load available users')
    }
  } catch (error) {
    console.error('Error loading available users:', error)
    toast.error(error.response?.data?.message || 'Failed to load available users')
    availableUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

// Update list name
const updateListName = async () => {
  if (!selectedListId.value || !listName.value.trim()) {
    toast.error('Please enter a list name')
    return
  }

  loading.value = true
  try {
    const response = await Axios.patch(`/lists/update-list-name/${selectedListId.value}`, {
      list_name: listName.value.trim(),
    })

    if (response.data.success) {
      toast.success('List name updated successfully')
      // Update the list in the dropdown
      const listIndex = lists.value.findIndex((l) => l.id === selectedListId.value)
      if (listIndex !== -1) {
        lists.value[listIndex].list_name = listName.value.trim()
      }
      // Reload list details
      await loadListDetails(selectedListId.value)
    } else {
      throw new Error(response.data.message || 'Failed to update list name')
    }
  } catch (error) {
    console.error('Error updating list name:', error)
    toast.error(error.response?.data?.message || 'Failed to update list name')
  } finally {
    loading.value = false
  }
}

// Remove user from list
const removeUser = async (userId) => {
  const result = await Swal.fire({
    title: 'Remove User',
    text: 'Are you sure you want to remove this user from the list?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      confirmButton: 'bg-swalCancel text-white hover:bg-swalCancel/80',
      cancelButton: 'bg-gray-500 text-white hover:bg-gray-600',
    },
  })

  if (!result.isConfirmed) return

  loading.value = true
  try {
    const response = await Axios.delete(`/lists/${selectedListId.value}/remove-user`, {
      data: { user_id: userId },
    })

    if (response.data.success) {
      toast.success('User removed successfully')
      // Reload list details and available users
      await loadListDetails(selectedListId.value)
      await loadAvailableUsers(selectedListId.value)
    } else {
      throw new Error(response.data.message || 'Failed to remove user')
    }
  } catch (error) {
    console.error('Error removing user:', error)
    toast.error(error.response?.data?.message || 'Failed to remove user')
  } finally {
    loading.value = false
  }
}

// Add user to list
const addUser = async (userId) => {
  loading.value = true
  try {
    const response = await Axios.post(`/lists/${selectedListId.value}/add-users`, {
      user_id: userId,
    })

    if (response.data.success) {
      toast.success('User added successfully')
      // Reload list details and available users
      await loadListDetails(selectedListId.value)
      await loadAvailableUsers(selectedListId.value)
    } else {
      throw new Error(response.data.message || 'Failed to add user')
    }
  } catch (error) {
    console.error('Error adding user:', error)
    toast.error(error.response?.data?.message || 'Failed to add user')
  } finally {
    loading.value = false
  }
}

// Delete list
const deleteList = async () => {
  const result = await Swal.fire({
    title: 'Delete List',
    text: 'Are you sure you want to delete this list? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      confirmButton: 'bg-swalCancel text-white hover:bg-swalCancel/80',
      cancelButton: 'bg-gray-500 text-white hover:bg-gray-600',
    },
  })

  if (!result.isConfirmed) return

  loading.value = true
  try {
    const response = await Axios.delete(`/lists/${selectedListId.value}/delete`)

    if (response.data.success) {
      toast.success('List deleted successfully')
      // Remove from lists array
      lists.value = lists.value.filter((l) => l.id !== selectedListId.value)
      // Reset selection
      selectedListId.value = null
      selectedList.value = null
      listName.value = ''
      availableUsers.value = []
    } else {
      throw new Error(response.data.message || 'Failed to delete list')
    }
  } catch (error) {
    console.error('Error deleting list:', error)
    toast.error(error.response?.data?.message || 'Failed to delete list')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLists()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-semibold">Random Game Lists</h1>
      <div class="flex justify-end">
        <router-link
          :to="{ name: 'RandomGameNewList' }"
          class="text-[#0085DB] hover:text-blue-700 font-medium"
        >
          Add a new List
        </router-link>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="flex flex-col gap-3">
          <!-- Instructions -->
          <p class="text-lg text-black my-2">
            Select list from below to edit it or just check the users in it:
          </p>

          <!-- Select List -->
          <div class="relative">
            <p class="text-black font-semibold mb-2">Select List:</p>
            <select
              v-model="selectedListId"
              @change="onListChange(selectedListId)"
              :disabled="loadingLists"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option :value="null">-- Select a list --</option>
              <option v-for="list in lists" :key="list.id" :value="list.id">
                {{ list.list_name }}
              </option>
            </select>
          </div>

          <hr v-if="selectedListId" class="mt-5 mx-2 border-orange-300" />

          <!-- List Name Update -->
          <div v-if="selectedListId" class="flex flex-col gap-3">
            <p class="text-black font-semibold">List Name:</p>
            <div class="flex gap-2">
              <input
                v-model="listName"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter list name"
              />
              <button
                @click="updateListName"
                :disabled="loading || !listName.trim()"
                class="px-6 py-2 bg-[#F8C076] text-white rounded-md hover:bg-[#F8C076]/90 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Update
              </button>
            </div>
          </div>

          <hr v-if="selectedListId" class="mt-5 border-orange-300" />

          <!-- Members of the list -->
          <div v-if="selectedList && selectedList.users" class="flex flex-col gap-3 my-6">
            <p class="text-black font-semibold">Members of the list:</p>
            <div v-if="selectedList.users.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="(user, index) in selectedList.users"
                :key="user.id"
                class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div class="flex items-center gap-2">
                  <span class="font-medium text-black">{{ index + 1 }}.</span>
                  <span class="text-gray-600">{{ user.email }}</span>
                </div>
                <button
                  @click="removeUser(user.id)"
                  :disabled="loading"
                  class="flex items-center justify-center w-7 h-7 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  title="Remove user"
                >
                  <img :src="MinusCircleIcon" alt="Remove user" class="w-7 h-7" />
                </button>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 italic">No users in this list yet.</div>
          </div>

          <!-- Add new user section -->
          <div v-if="selectedListId" class="flex flex-col gap-3">
            <p class="text-black font-semibold">Add a new user to the current list:</p>

            <div v-if="availableUsers.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  @click="addUser(user.id)"
                  :disabled="loading"
                  class="flex items-center justify-center w-7 h-7 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  title="Add user"
                >
                  <img :src="PlusCircleIcon" alt="Add user" class="w-7 h-7" />
                </button>
              </div>
            </div>
            <div v-else-if="!loadingUsers" class="text-sm text-gray-500 italic">
              No available users to add.
            </div>
          </div>

          <!-- Delete List Button -->
          <div v-if="selectedListId" class="flex justify-end mt-6">
            <button
              @click="deleteList"
              :disabled="loading"
              class="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <TrashIcon class="w-6 h-6" />
              <span>Delete List</span>
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
