<template>
  <div class="p-4">
    <a href=".../../" class="text-nowrap">
      <img src="../../../assets/images/logos/logo-light.svg" alt="Logo-Dark" />
    </a>
  </div>
  <div class="scroll-sidebar" data-simplebar="">
    <nav class="w-full flex flex-col sidebar-nav px-4 mt-5">
      <ul id="sidebarnav" class="text-gray-600 text-sm">
        <li class="text-xs font-bold pb-[5px]">
          <i class="ti ti-dots nav-small-cap-icon text-lg hidden text-center"></i>
          <span class="text-xs text-gray-400 font-semibold">HOME</span>
        </li>

        <li class="sidebar-item" :class="{ selected: $route.name === 'DashboardPage' }">
          <router-link
            :to="{ name: 'DashboardPage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'DashboardPage' }"
          >
            <i class="ti ti-layout-dashboard ps-2 text-2xl"></i> <span>Dashboard</span>
          </router-link>
        </li>

        <li class="text-xs font-bold mb-4 mt-6">
          <i class="ti ti-dots nav-small-cap-icon text-lg hidden text-center"></i>
          <span class="text-xs text-gray-400 font-semibold">Users</span>
        </li>

        <li class="sidebar-item">
          <router-link
            :to="{ name: 'AdminUsersViewPage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'AdminUsersViewPage' }"
          >
            <i class="ti ti-users ps-2 text-2xl"></i> <span>Users</span>
          </router-link>
        </li>

        <li class="sidebar-item">
          <router-link
            :to="{ name: 'AdminUserSendInvitePage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'AdminUserSendInvitePage' }"
          >
            <i class="ti ti-article ps-2 text-2xl"></i> <span>Send User Invite</span>
          </router-link>
        </li>

        <li class="text-xs font-bold mb-4 mt-8">
          <i class="ti ti-dots nav-small-cap-icon text-lg hidden text-center"></i>
          <span class="text-xs text-gray-400 font-semibold">COURSES</span>
        </li>

        <li class="sidebar-item">
          <router-link
            :to="{ name: 'AdminCourseViewPage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'AdminCourseViewPage' }"
          >
            <i class="ti ti-book ps-2 text-2xl"></i> <span>Courses</span>
          </router-link>
        </li>

        <li class="sidebar-item">
          <router-link
            :to="{ name: 'AdminCourseStatsViewPage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'AdminCourseStatsViewPage' }"
          >
            <i class="ti ti-chart-bar ps-2 text-2xl"></i> <span>Course Stats</span>
          </router-link>
        </li>

        <li class="sidebar-item" :class="{ selected: $route.name === 'AdminScoreboardViewPage' }">
          <router-link
            :to="{ name: 'AdminScoreboardViewPage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'AdminScoreboardViewPage' }"
          >
            <i class="ti ti-trophy ps-2 text-2xl"></i> <span>Scoreboard</span>
          </router-link>
        </li>

        <li class="text-xs font-bold mb-4 mt-8">
          <i class="ti ti-dots nav-small-cap-icon text-lg hidden text-center"></i>
          <span class="text-xs text-gray-400 font-semibold">AUTH</span>
        </li>

        <li class="sidebar-item">
          <a
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            href="../../pages/authentication-login.html"
          >
            <i class="ti ti-login ps-2 text-2xl"></i> <span>Login</span>
          </a>
        </li>

        <li class="sidebar-item">
          <a
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            href="../../pages/authentication-register.html"
          >
            <i class="ti ti-user-plus ps-2 text-2xl"></i> <span>Register</span>
          </a>
        </li>

        <li class="text-xs font-bold mb-4 mt-8">
          <i class="ti ti-dots nav-small-cap-icon text-lg hidden text-center"></i>
          <span class="text-xs text-gray-400 font-semibold">EXTRA</span>
        </li>

        <li class="sidebar-item">
          <a
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            href="../../pages/icons.html"
          >
            <i class="ti ti-mood-happy ps-2 text-2xl"></i> <span>Icons</span>
          </a>
        </li>

        <li class="sidebar-item" :class="{ selected: $route.name === 'SamplePage' }">
          <router-link
            :to="{ name: 'SamplePage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'SamplePage' }"
          >
            <i class="ti ti-aperture ps-2 text-2xl"></i> <span>Sample Page</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>
