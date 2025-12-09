<template>
  <div class="p-4">
    <a href="../../" class="text-nowrap">
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

        <li class="text-xs font-bold mb-4 mt-8">
          <i class="ti ti-dots nav-small-cap-icon text-lg hidden text-center"></i>
          <span class="text-xs text-gray-400 font-semibold">COURSES</span>
        </li>

        <li class="sidebar-item" :class="{ selected: $route.name === 'UserCourseViewPage' }">
          <router-link
            :to="{ name: 'UserCourseViewPage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'UserCourseViewPage' }"
          >
            <i class="ti ti-book ps-2 text-2xl"></i> <span>Courses</span>
          </router-link>
        </li>

        <li class="sidebar-item" :class="{ selected: $route.name === 'UserScoreboardViewPage' }">
          <router-link
            :to="{ name: 'UserScoreboardViewPage' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'UserScoreboardViewPage' }"
          >
            <i class="ti ti-trophy ps-2 text-2xl"></i> <span>Scoreboard</span>
          </router-link>
        </li>

        <li class="text-xs font-bold mb-4 mt-8">
          <i class="ti ti-dots nav-small-cap-icon text-lg hidden text-center"></i>
          <span class="text-xs text-gray-400 font-semibold">Games</span>
        </li>

        <li class="sidebar-item" :class="{ selected: $route.name === 'RandomGame' }">
          <router-link
            :to="{ name: 'RandomGame' }"
            class="sidebar-link gap-3 py-2.5 my-1 text-base flex items-center relative rounded-md text-gray-500 w-full"
            :class="{ active: $route.name === 'RandomGame' }"
          >
            <i class="ti ti-dice ps-2 text-2xl"></i> <span>Random Game</span>
          </router-link>
        </li>

        <li class="text-xs font-bold mb-4 mt-8">
          <i class="ti ti-dots nav-small-cap-icon text-lg hidden text-center"></i>
          <span class="text-xs text-gray-400 font-semibold">EXTRA</span>
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
