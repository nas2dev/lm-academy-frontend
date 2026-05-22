<script setup>
defineProps({
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
  <div class="card">
    <div class="card-body">
      <h4 class="text-gray-500 text-lg font-semibold mb-4">Quick Actions</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

        <!-- Student Quick Actions -->
        <template v-if="isUser">
          <router-link
            :to="{ name: 'UserCourseViewPage' }"
            class="quick-action-btn btn-blue"
          >
            <i class="ti ti-book"></i>
            <span>Courses</span>
          </router-link>

          <router-link
            :to="{ name: 'UserScoreboardViewPage' }"
            class="quick-action-btn btn-teal"
          >
            <i class="ti ti-trophy"></i>
            <span>Scoreboard</span>
          </router-link>

          <router-link
            :to="{ name: 'RandomGame' }"
            class="quick-action-btn btn-amber"
          >
            <i class="ti ti-dice"></i>
            <span>Random Game</span>
          </router-link>

          <router-link
            :to="{ name: 'UserProfilePage' }"
            class="quick-action-btn btn-red"
          >
            <i class="ti ti-user"></i>
            <span>My Profile</span>
          </router-link>
        </template>

        <!-- Admin Quick Actions -->
        <template v-else-if="isAdmin">
          <router-link
            :to="{ name: 'AdminCourseViewPage' }"
            class="quick-action-btn btn-blue"
          >
            <i class="ti ti-book"></i>
            <span>Manage Courses</span>
          </router-link>

          <router-link
            :to="{ name: 'AdminUsersViewPage' }"
            class="quick-action-btn btn-teal"
          >
            <i class="ti ti-users"></i>
            <span>Users</span>
          </router-link>

          <router-link
            :to="{ name: 'AdminCourseStatsViewPage' }"
            class="quick-action-btn btn-amber"
          >
            <i class="ti ti-chart-bar"></i>
            <span>Course Stats</span>
          </router-link>

          <router-link
            :to="{ name: 'RandomGame' }"
            class="quick-action-btn btn-red"
          >
            <i class="ti ti-dice"></i>
            <span>Random Game</span>
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb; /* border-gray-200 */
  background-color: #ffffff;
  text-decoration: none;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-action-btn i {
  font-size: 1.5rem;
  color: #9ca3af; /* text-gray-400 */
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-action-btn span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280; /* text-gray-500 */
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover base behaviors */
.quick-action-btn:hover {
  transform: translateY(-3px);
}
.quick-action-btn:hover i {
  transform: scale(1.1);
}

/* Blue Action */
.btn-blue:hover {
  border-color: rgb(147, 197, 253); /* border-blue-300 */
  background-color: rgba(59, 130, 246, 0.08); /* light blue */
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.12), 0 4px 6px -4px rgba(59, 130, 246, 0.12);
}
.btn-blue:hover i,
.btn-blue:hover span {
  color: rgb(37, 99, 235); /* text-blue-600 */
}

/* Teal Action */
.btn-teal:hover {
  border-color: rgb(153, 246, 228); /* border-teal-300 */
  background-color: rgba(20, 184, 166, 0.08); /* light teal */
  box-shadow: 0 10px 15px -3px rgba(20, 184, 166, 0.12), 0 4px 6px -4px rgba(20, 184, 166, 0.12);
}
.btn-teal:hover i,
.btn-teal:hover span {
  color: rgb(13, 148, 136); /* text-teal-600 */
}

/* Amber Action */
.btn-amber:hover {
  border-color: rgb(253, 230, 138); /* border-amber-300 */
  background-color: rgba(245, 158, 11, 0.08); /* light amber */
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.12), 0 4px 6px -4px rgba(245, 158, 11, 0.12);
}
.btn-amber:hover i,
.btn-amber:hover span {
  color: rgb(217, 119, 6); /* text-amber-600 */
}

/* Red Action */
.btn-red:hover {
  border-color: rgb(254, 202, 202); /* border-red-300 */
  background-color: rgba(239, 68, 68, 0.08); /* light red */
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.12), 0 4px 6px -4px rgba(239, 68, 68, 0.12);
}
.btn-red:hover i,
.btn-red:hover span {
  color: rgb(220, 38, 38); /* text-red-600 */
}
</style>
