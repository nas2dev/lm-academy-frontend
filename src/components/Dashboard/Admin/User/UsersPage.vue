<script setup>
import { ref, onMounted } from 'vue'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/Dashboard/General/DataTable.vue'
import { getProfileImageUrl } from '@/utils/backendHelper'
import { useUserStore } from '@/stores/useUserStore'
import RoleChangeModal from '@/components/Dashboard/Admin/User/RoleChangeModal.vue'
import StatusChangeModal from '@/components/Dashboard/Admin/User/StatusChangeModal.vue'

const userStore = useUserStore()
const toast = useToast()

// State
const users = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref(null)

// Table Configuration
const columns = [
  { key: 'nr', label: 'Nr' },
  { key: 'image', label: 'Picture' },
  { key: 'name', label: 'Name' },
  { key: 'academic_year', label: 'Ac. Year' },
  { key: 'email', label: 'Email' },
  { key: 'tel', label: 'Tel' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

// Search and pagination params
const searchTerm = ref('')
const currentPage = ref(1)
const perPage = ref(5)

// Fetch users

const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      per_page: perPage.value,
    })

    if (searchTerm.value) {
      params.append('searchTerm', searchTerm.value)
    }

    const response = await Axios.get(`/users/all-users?${params}`)

    if (response.data.success) {
      console.log('response', response.data)
      users.value = response.data.users.data.map((user, index) => ({
        ...user,
        nr: (currentPage.value - 1) * perPage.value + index + 1,
        name: `${user.first_name} ${user.last_name}`,
        tel: user.user_info?.tel || 'N/A',
        role: user.roles?.[0]?.name || 'N/A',
        status: user.acc_status ? 'Active' : 'Inactive',
      }))

      pagination.value = {
        current_page: response.data.users.current_page,
        per_page: response.data.users.per_page,
        total: response.data.users.total,
        last_page: response.data.users.last_page,
        from: response.data.users.from,
        to: response.data.users.to,
        prev_page_url: response.data.users.prev_page_url,
        next_page_url: response.data.users.next_page_url,
      }
    } else {
      throw new Error(response.data.message || 'Failed to fetch users')
    }
  } catch (error) {
    console.error('Error fetching users', error)
    error.value = error.response?.data?.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

// Event handlers
const handleSearch = (term) => {
  searchTerm.value = term
  currentPage.value = 1
  fetchUsers()
}

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage
  currentPage.value = 1
  fetchUsers()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchUsers()
}

const handleRefresh = () => {
  fetchUsers()
}

// Role Change modal state
const showRoleModal = ref(false)
const selectedUser = ref(null)
const newRole = ref('')

const openRoleModal = (user) => {
  selectedUser.value = user
  newRole.value = user.role === 'Admin' ? 'User' : 'Admin'
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  selectedUser.value = null
  newRole.value = ''
}

const confirmRoleChange = async () => {
  if (!selectedUser.value) return

  try {
    const response = await Axios.post('users/change-role', {
      user_id: selectedUser.value.id,
      role: newRole.value,
    })

    if (response.data.success) {
      // Update the user in the local array
      const userIndex = users.value.findIndex((u) => u.id === selectedUser.value.id)
      if (userIndex !== -1) {
        users.value[userIndex].role = newRole.value
      }

      closeRoleModal()
      toast.success('Role changed successfully')
    } else {
      toast.error(response.data.message || 'Failed to change role')
      throw new Error(response.data.message || 'Failed to change role')
    }
  } catch (error) {
    console.error('Error changing role:', error)
    toast.error(error.response?.data?.message || 'Failed to change role')
  }
}

// Status Change modal state
const showStatusModal = ref(false)
const selectedUserForStatus = ref(null)

const openStatusModal = (user) => {
  selectedUserForStatus.value = user
  showStatusModal.value = true
}

const closeStatusModal = () => {
  showStatusModal.value = false
  selectedUserForStatus.value = null
}

const confirmStatusChange = async () => {
  if (!selectedUserForStatus.value) return

  try {
    const newStatus = selectedUserForStatus.value.acc_status === 1 ? 0 : 1

    const response = await Axios.post('users/change-status', {
      user_id: selectedUserForStatus.value.id,
      status: newStatus,
    })

    if (response.data.success) {
      const userIndex = users.value.findIndex((u) => u.id === selectedUserForStatus.value.id)
      if (userIndex !== -1) {
        users.value[userIndex].acc_status = newStatus
        users.value[userIndex].status = newStatus === 1 ? 'Active' : 'Inactive'
      }

      closeStatusModal()
      toast.success('Status changed successfully')
    } else {
      toast.error(response.data.message || 'Failed to change status')
      throw new Error(response.data.message || 'Failed to change status')
    }
  } catch (error) {
    console.error('Error changing status:', error)
    toast.error(error.response?.data?.message || 'Failed to change status')
  }
}

const getProfileRoute = (userId) => {
  const currentUserId = userStore.user?.id
  if (userId === currentUserId) {
    return { name: 'UserProfilePage' }
  } else {
    return { name: 'UserProfileByIdPage', params: { userId } }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <DataTable
    title="Users"
    :columns="columns"
    :loading="loading"
    :error="error"
    :data="users"
    :pagination="pagination"
    search-placeholder="Search..."
    @search="handleSearch"
    @per-page-change="handlePerPageChange"
    @page-change="handlePageChange"
    @refresh="handleRefresh"
  >
    <!-- Custom cell templates -->
    <template #cell-image="{ row }">
      <img
        :src="getProfileImageUrl(row.image)"
        :alt="row.name"
        class="h-10 w-10 rounded-full object-cover"
      />
    </template>

    <template #cell-name="{ row }">
      <div class="flex flex-col">
        <div class="text-sm font-medium text-gray-900">{{ row.first_name }}</div>
        <div class="text-sm font-medium text-gray-900">{{ row.last_name }}</div>
      </div>
    </template>

    <template #cell-role="{ row }">
      <button
        @click="openRoleModal(row)"
        :class="[
          'px-14 py-3 text-sm font-medium rounded-full border-0 cursor-pointer w-20 flex items-center justify-center transition-colors duration-200',
          row.role === 'Admin'
            ? 'bg-[#FFF6EA] text-[#F8C076] hover:bg-[#F8C076] hover:text-[#FFF6EA]'
            : 'bg-[#FFEDE9] text-[#FB9984] hover:bg-[#FB9984] hover:text-[#FFEDE9]',
        ]"
      >
        {{ row.role }}
      </button>
    </template>

    <template #cell-status="{ row }">
      <button
        @click="openStatusModal(row)"
        :class="[
          'px-14 py-3 text-sm font-medium rounded-full border cursor-pointer w-20 flex items-center justify-center transition-colors duration-200',
          row.status === 'Active'
            ? 'bg-white text-[#4BD08B] border-[#4BD08B] hover:bg-[#4BD08B] hover:text-white hover:border-[#4BD08B]'
            : 'bg-white text-[#FB977D] border-[#FB977D] hover:bg-[#FB977D] hover:text-white hover:border-[#FB977D]',
        ]"
      >
        {{ row.status }}
      </button>
    </template>

    <template #cell-actions="{ row }">
      <router-link
        :to="getProfileRoute(row.id)"
        target="_blank"
        class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-all duration-200 group flex items-center gap-1"
      >
        <span>Check</span>
        <span class="inline-block transition-transform duration-200 group-hover:translate-x-1"
          >→</span
        >
      </router-link>
    </template>
  </DataTable>

  <RoleChangeModal
    :is-open="showRoleModal"
    :new-role="newRole"
    @close="closeRoleModal"
    @confirm="confirmRoleChange"
  />

  <StatusChangeModal
    :is-open="showStatusModal"
    :current-status="selectedUserForStatus?.acc_status"
    @close="closeStatusModal"
    @confirm="confirmStatusChange"
  />
</template>
