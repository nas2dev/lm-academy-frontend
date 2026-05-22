<script setup>
import { getProfileImageUrl } from '@/utils/backendHelper'
import { useRouter } from 'vue-router'

defineProps({
  scoreboardLoading: {
    type: Boolean,
    required: true
  },
  scoreboard: {
    type: Array,
    required: true,
    default: () => []
  },
  isAdmin: {
    type: Boolean,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  myRank: {
    type: Number,
    default: null
  }
})

const router = useRouter()

const getTrophyIcon = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}

const getProfileImage = (imagePath) => {
  return getProfileImageUrl(imagePath, null)
}

const openUserProfile = (userId) => {
  const routeData = router.resolve({ name: 'UserProfileByIdPage', params: { userId } })
  window.open(routeData.href, '_blank')
}
</script>

<template>
  <div class="card h-full">
    <div class="card-body">
      <div class="flex items-center justify-between mb-5">
        <h4 class="text-gray-500 text-lg font-semibold">Top Scoreboard</h4>
        <router-link
          :to="{ name: isAdmin ? 'AdminScoreboardViewPage' : 'UserScoreboardViewPage' }"
          class="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
        >
          View All →
        </router-link>
      </div>

      <!-- Scoreboard loading -->
      <div v-if="scoreboardLoading" class="flex justify-center py-6">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>

      <!-- Scoreboard entries -->
      <div v-else-if="scoreboard.length > 0" class="space-y-3">
        <div
          v-for="entry in scoreboard"
          :key="entry.id"
          class="scoreboard-entry flex items-center gap-3 p-2.5 rounded-lg transition-colors"
          :class="{
            'bg-yellow-400': entry.rank === 1,
            'bg-gray-100': entry.rank === 2,
            'hover:bg-gray-100': entry.rank > 2,
            'cursor-pointer': isAdmin
          }"
          @click="isAdmin && entry.user && openUserProfile(entry.user.id)"
        >
          <!-- Rank -->
          <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <span v-if="entry.rank <= 3" class="text-lg">{{ getTrophyIcon(entry.rank) }}</span>
            <span v-else class="text-gray-400 font-bold text-sm">{{ entry.rank }}</span>
          </div>

          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
            <img
              v-if="entry.user"
              :src="getProfileImage(entry.user.image)"
              :alt="`${entry.user.first_name} ${entry.user.last_name}`"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Name -->
          <div class="flex-1 min-w-0">
            <p class="text-gray-500 text-sm font-medium truncate" v-if="entry.user">
              {{ entry.user.first_name }} {{ entry.user.last_name }}
            </p>
          </div>

          <!-- Score -->
          <span class="text-gray-500 font-bold text-sm whitespace-nowrap">
            {{ entry.score }} <span class="text-gray-400 font-normal text-xs">pts</span>
          </span>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-6">
        <i class="ti ti-trophy text-3xl text-gray-400 opacity-60 block mb-2"></i>
        <p class="text-gray-400 text-sm">No scoreboard data yet</p>
      </div>

      <!-- Student rank highlight -->
      <div v-if="isUser && myRank && !scoreboardLoading" class="mt-4 pt-4 border-t border-gray-100">
        <div class="flex items-center justify-between">
          <p class="text-gray-400 text-sm">Your Rank</p>
          <p class="text-blue-600 font-bold text-lg">#{{ myRank }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scoreboard-entry {
  transition: background-color 0.15s ease;
}
</style>
