<script setup>
defineProps({
  dashboardData: {
    type: Object,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div>
    <!-- ============ STUDENT STATS CARDS ============ -->
    <div v-if="isUser" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Enrolled Courses -->
      <div class="stat-card card card-blue group hover:shadow-lg transition-all duration-300">
        <div class="card-body flex items-center gap-4">
          <div class="stat-icon-wrap">
            <i class="ti ti-book"></i>
          </div>
          <div>
            <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">Enrolled</p>
            <h3 class="text-2xl font-bold text-gray-500 mt-0.5">{{ dashboardData.enrolled_courses }}</h3>
          </div>
        </div>
      </div>

      <!-- Completed Courses -->
      <div class="stat-card card card-teal group hover:shadow-lg transition-all duration-300">
        <div class="card-body flex items-center gap-4">
          <div class="stat-icon-wrap">
            <i class="ti ti-circle-check"></i>
          </div>
          <div>
            <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">Completed</p>
            <h3 class="text-2xl font-bold text-gray-500 mt-0.5">{{ dashboardData.completed_courses }}</h3>
          </div>
        </div>
      </div>

      <!-- In Progress -->
      <div class="stat-card card card-amber group hover:shadow-lg transition-all duration-300">
        <div class="card-body flex items-center gap-4">
          <div class="stat-icon-wrap">
            <i class="ti ti-loader"></i>
          </div>
          <div>
            <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">In Progress</p>
            <h3 class="text-2xl font-bold text-gray-500 mt-0.5">{{ dashboardData.in_progress_courses }}</h3>
          </div>
        </div>
      </div>

      <!-- My Score -->
      <div class="stat-card card card-red group hover:shadow-lg transition-all duration-300">
        <div class="card-body flex items-center gap-4">
          <div class="stat-icon-wrap">
            <i class="ti ti-trophy"></i>
          </div>
          <div>
            <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">My Score</p>
            <h3 class="text-2xl font-bold text-gray-500 mt-0.5">
              {{ dashboardData.my_score || 0 }}
              <span class="text-sm font-normal text-gray-400">pts</span>
            </h3>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ ADMIN STATS CARDS ============ -->
    <div v-else-if="isAdmin" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Students -->
      <div class="stat-card card card-blue group hover:shadow-lg transition-all duration-300">
        <div class="card-body flex items-center gap-4">
          <div class="stat-icon-wrap">
            <i class="ti ti-users"></i>
          </div>
          <div>
            <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">Students</p>
            <h3 class="text-2xl font-bold text-gray-500 mt-0.5">{{ dashboardData.total_students }}</h3>
          </div>
        </div>
      </div>

      <!-- Total Courses -->
      <div class="stat-card card card-teal group hover:shadow-lg transition-all duration-300">
        <div class="card-body flex items-center gap-4">
          <div class="stat-icon-wrap">
            <i class="ti ti-book"></i>
          </div>
          <div>
            <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">Courses</p>
            <h3 class="text-2xl font-bold text-gray-500 mt-0.5">{{ dashboardData.total_courses }}</h3>
          </div>
        </div>
      </div>

      <!-- Active Enrollments -->
      <div class="stat-card card card-amber group hover:shadow-lg transition-all duration-300">
        <div class="card-body flex items-center gap-4">
          <div class="stat-icon-wrap">
            <i class="ti ti-clipboard-list"></i>
          </div>
          <div>
            <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">Enrollments</p>
            <h3 class="text-2xl font-bold text-gray-500 mt-0.5">{{ dashboardData.active_enrollments }}</h3>
          </div>
        </div>
      </div>

      <!-- Avg Completion -->
      <div class="stat-card card card-red group hover:shadow-lg transition-all duration-300">
        <div class="card-body flex items-center gap-4">
          <div class="stat-icon-wrap">
            <i class="ti ti-chart-pie"></i>
          </div>
          <div>
            <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">Avg Completion</p>
            <h3 class="text-2xl font-bold text-gray-500 mt-0.5">
              {{ dashboardData.avg_completion || 0 }}
              <span class="text-sm font-normal text-gray-400">%</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-icon-wrap i {
  font-size: 1.35rem;
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Blue Card (Enrolled / Students) */
.card-blue .stat-icon-wrap {
  background-color: rgba(59, 130, 246, 0.1);
}
.card-blue .stat-icon-wrap i {
  color: rgb(37, 99, 235);
}
.card-blue:hover .stat-icon-wrap {
  background-color: rgb(37, 99, 235);
  transform: scale(1.05);
}
.card-blue:hover .stat-icon-wrap i {
  color: #ffffff;
}
.card-blue:hover {
  box-shadow: 0 12px 20px -8px rgba(37, 99, 235, 0.25);
}

/* Teal Card (Completed / Courses) */
.card-teal .stat-icon-wrap {
  background-color: rgba(20, 184, 166, 0.1);
}
.card-teal .stat-icon-wrap i {
  color: rgb(13, 148, 136);
}
.card-teal:hover .stat-icon-wrap {
  background-color: rgb(13, 148, 136);
  transform: scale(1.05);
}
.card-teal:hover .stat-icon-wrap i {
  color: #ffffff;
}
.card-teal:hover {
  box-shadow: 0 12px 20px -8px rgba(13, 148, 136, 0.25);
}

/* Amber Card (In Progress / Enrollments) */
.card-amber .stat-icon-wrap {
  background-color: rgba(245, 158, 11, 0.1);
}
.card-amber .stat-icon-wrap i {
  color: rgb(217, 119, 6);
}
.card-amber:hover .stat-icon-wrap {
  background-color: rgb(217, 119, 6);
  transform: scale(1.05);
}
.card-amber:hover .stat-icon-wrap i {
  color: #ffffff;
}
.card-amber:hover {
  box-shadow: 0 12px 20px -8px rgba(217, 119, 6, 0.25);
}

/* Red Card (Score / Avg Completion) */
.card-red .stat-icon-wrap {
  background-color: rgba(239, 68, 68, 0.1);
}
.card-red .stat-icon-wrap i {
  color: rgb(220, 38, 38);
}
.card-red:hover .stat-icon-wrap {
  background-color: rgb(220, 38, 38);
  transform: scale(1.05);
}
.card-red:hover .stat-icon-wrap i {
  color: #ffffff;
}
.card-red:hover {
  box-shadow: 0 12px 20px -8px rgba(220, 38, 38, 0.25);
}
</style>
