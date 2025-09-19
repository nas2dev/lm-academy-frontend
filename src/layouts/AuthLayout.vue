<script setup>
import AuthFooter from '@/components/Auth/General/AuthFooter.vue'
</script>
<template>
  <main>
    <div
      class="flex flex-col w-full overflow-hidden relative min-h-screen radial-gradient items-center justify-center g-0 px-4"
    >
      <router-view />
      <AuthFooter />
    </div>
  </main>
</template>
