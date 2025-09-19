<script setup>
import DashboardSidebar from '@/components/Dashboard/General/DashboardSidebar.vue'
import DashboardHeader from '@/components/Dashboard/General/DashboardHeader.vue'
import DashboardFooter from '@/components/Dashboard/General/DashboardFooter.vue'
</script>
<template>
  <main>
    <!--start the project-->
    <div id="main-wrapper" class="flex p-5 xl:pr-0">
      <!-- Dashboard Sidebar -->
      <DashboardSidebar />
      <!-- End Dashboard Sidebar -->

      <div class="w-full page-wrapper xl:px-6 px-0">
        <!-- Main Content -->
        <main class="h-full max-w-full">
          <div class="container full-container p-0 flex flex-col gap-6">
            <!--  Header Start -->
            <DashboardHeader />
            <!--  Header End -->
            <!-- here we must insert the content of the page -->
            <router-view />
            <!-- Footer -->
            <DashboardFooter />
            <!-- End Footer -->
          </div>
        </main>
        <!-- Main Content End -->
      </div>
    </div>
    <!--end of project-->
  </main>
</template>
