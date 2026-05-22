<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import Axios from '@/utils/axios'

// Child components
import WelcomeBanner from '@/components/Dashboard/Home/WelcomeBanner.vue'
import DashboardStatsCards from '@/components/Dashboard/Home/DashboardStatsCards.vue'
import ActiveCoursesList from '@/components/Dashboard/Home/ActiveCoursesList.vue'
import CourseOverview from '@/components/Dashboard/Home/CourseOverview.vue'
import ScoreboardPreview from '@/components/Dashboard/Home/ScoreboardPreview.vue'
import QuickActions from '@/components/Dashboard/Home/QuickActions.vue'

const userStore = useUserStore()

const isAdmin = computed(() => userStore.isAdmin)
const isUser = computed(() => userStore.isUser)
const firstName = computed(() => userStore.user?.first_name || 'there')

// Dashboard data
const dashboardData = ref(null)
const scoreboard = ref([])
const loading = ref(true)
const scoreboardLoading = ref(true)
const error = ref(null)

// Greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const fetchDashboardData = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await Axios.get('/dashboard')
    if (data.success) {
      dashboardData.value = data.data
    } else {
      throw new Error(data.message || 'Failed to fetch dashboard data')
    }
  } catch (err) {
    console.error('Dashboard fetch error:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

const fetchScoreboard = async () => {
  scoreboardLoading.value = true
  try {
    const { data } = await Axios.get('/scoreboard', { params: { limit: 10 } })
    if (data.success) {
      scoreboard.value = data.data.slice(0, 10).map((item, index) => ({
        id: item.id,
        rank: index + 1,
        score: item.score || 0,
        user: item.user || null,
      }))
    }
  } catch (err) {
    console.error('Scoreboard fetch error:', err)
  } finally {
    scoreboardLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
  fetchScoreboard()
})
</script>

<template>
  <div class="dashboard-home space-y-6">

    <!-- ==================== WELCOME BANNER ==================== -->
    <WelcomeBanner
      :greeting="greeting"
      :firstName="firstName"
      :isUser="isUser"
      :isAdmin="isAdmin"
    />

    <!-- ==================== LOADING STATE ==================== -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- ==================== ERROR STATE ==================== -->
    <div v-else-if="error" class="card">
      <div class="card-body text-center py-8">
        <i class="ti ti-alert-circle text-4xl text-red-500 mb-3 block"></i>
        <p class="text-gray-500 font-medium mb-2">{{ error }}</p>
        <button
          @click="fetchDashboardData"
          class="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- ==================== DASHBOARD CONTENT ==================== -->
    <template v-else-if="dashboardData">

      <!-- ============ STATS CARDS ============ -->
      <DashboardStatsCards
        :dashboardData="dashboardData"
        :isUser="isUser"
        :isAdmin="isAdmin"
      />

      <!-- ==================== MAIN CONTENT GRID ==================== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- ============ LEFT COLUMN (2/3 width) ============ -->
        <div class="lg:col-span-2">
          <!-- STUDENT: Active Courses with Progress -->
          <ActiveCoursesList
            v-if="isUser"
            :activeCourses="dashboardData.active_courses"
          />

          <!-- ADMIN: Course Overview -->
          <CourseOverview
            v-else-if="isAdmin"
            :courseOverview="dashboardData.course_overview"
          />
        </div>

        <!-- ============ RIGHT COLUMN (1/3 width) — SCOREBOARD ============ -->
        <div class="lg:col-span-1">
          <ScoreboardPreview
            :scoreboardLoading="scoreboardLoading"
            :scoreboard="scoreboard"
            :isAdmin="isAdmin"
            :isUser="isUser"
            :myRank="dashboardData.my_rank"
          />
        </div>
      </div>

      <!-- ==================== QUICK ACTIONS ==================== -->
      <QuickActions
        :isUser="isUser"
        :isAdmin="isAdmin"
      />

    </template>
  </div>
</template>

<style scoped>
/* Responsive grid fix for sm breakpoint */
@media (min-width: 640px) {
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sm\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* lg grid-cols-4 override */
@media (min-width: 1024px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .lg\:col-span-2 {
    grid-column: span 2 / span 2;
  }

  .lg\:col-span-1 {
    grid-column: span 1 / span 1;
  }
}

/* Fade-in animation for dashboard sections */
.dashboard-home > * {
  animation: fadeInUp 0.4s ease-out both;
}

.dashboard-home > *:nth-child(1) { animation-delay: 0s; }
.dashboard-home > *:nth-child(2) { animation-delay: 0.05s; }
.dashboard-home > *:nth-child(3) { animation-delay: 0.1s; }
.dashboard-home > *:nth-child(4) { animation-delay: 0.15s; }
.dashboard-home > *:nth-child(5) { animation-delay: 0.2s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
