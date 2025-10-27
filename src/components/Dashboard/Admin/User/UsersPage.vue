<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/Dashboard/General/DataTable.vue'

const router = useRouter()
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
  />
</template>
