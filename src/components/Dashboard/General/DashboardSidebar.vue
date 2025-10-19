<script setup lang="ts">
import AdminSidebar from '@/components/Dashboard/General/AdminSidebar.vue'
import UserSidebar from '@/components/Dashboard/General/UserSidebar.vue'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()
</script>

<template>
  <aside
    id="application-sidebar-brand"
    class="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full transform hidden xl:block xl:translate-x-0 xl:end-auto xl:bottom-0 fixed xl:top-5 xl:left-auto top-0 left-0 with-vertical h-screen z-[999] shrink-0 w-[270px] shadow-md xl:rounded-md rounded-none bg-white left-sidebar transition-all duration-300"
  >
    <!-- ---------------------------------- -->
    <!-- Start Vertical Layout Sidebar -->
    <!-- ---------------------------------- -->
    <AdminSidebar v-if="userStore.isAdmin" />
    <UserSidebar v-if="userStore.isUser" />
    <!-- </aside> -->
  </aside>
</template>
