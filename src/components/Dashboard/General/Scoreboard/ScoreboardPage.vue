<script setup>
import { ref, onMounted } from 'vue'
import Axios from '@/utils/axios'
import { useToast } from 'vue-toastification'
import { getProfileImageUrl } from '@/utils/backendHelper'
const toast = useToast()

const scoreboard = ref([])
const loading = ref(false)
const error = ref(null)

const getProfileImageUrlFromBackend = (imagePath) => {
  return getProfileImageUrl(imagePath, null)
}

const fetchScoreboard = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await Axios.get('/scoreboard')

    if (response.data.success) {
      scoreboard.value = response.data.data.map((item, index) => ({
        id: item.id,
        rank: index + 1,
        user_id: item.user_id,
        score: item.score || 0,
        user: item.user || null,
      }))
    } else {
      throw new Error(response.data.message || 'Failed to fetch scoreboard')
    }
  } catch (err) {
    console.error('Error fetching scoreboard', err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch scoreboard'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const getTrophyIcon = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return '🏆'
}

const getTrophyColor = (rank) => {
  if (rank === 1) return 'text-yellow-500'
  if (rank === 2) return 'text-gray-400'
  if (rank === 3) return 'text-orange-600'
  return 'text-gray-300'
}

onMounted(() => {
  fetchScoreboard()
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Scoreboard</h2>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <!-- Scoreboard Card -->
    <div class="w-full bg-white shadow-2xl p-4 rounded-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h5 class="text-xl font-bold">Progress in the live Scoreboard</h5>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Live</span>
          <span class="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
        </div>
      </div>

      <!-- Scoreboard Table -->
      <div v-if="!loading && scoreboard.length > 0">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase rounded-lg border-b-[1px] border-gray-900">
            <tr>
              <th scope="col" class="px-6 py-3 text-left">Nr</th>
              <th scope="col" class="px-6 py-3 text-center">User</th>
              <th scope="col" class="px-6 py-3 text-right">Points</th>
              <th scope="col" class="px-6 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in scoreboard"
              :key="item.id"
              :class="['text-black', { 'border-b': index !== scoreboard.length - 1 }]"
            >
              <td class="px-6 py-4 text-left">{{ item.rank }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-3">
                  <!--  -->
                  <div
                    class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
                  >
                    <img
                      :alt="`${item.user.first_name} ${item.user.last_name}`"
                      :src="getProfileImageUrlFromBackend(item.user.image)"
                      class="object-cover z-[999999]"
                    />
                  </div>

                  <div>
                    <div class="font-medium text-gray-900">{{ item.user.first_name || 'N/A' }}</div>
                    <div class="font-medium text-gray-500">{{ item.user.last_name || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <span class="font-semibold">{{ item.score }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="item.rank <= 3" :class="['text-x', getTrophyColor(item.rank)]">
                  {{ getTrophyIcon(item.rank) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
