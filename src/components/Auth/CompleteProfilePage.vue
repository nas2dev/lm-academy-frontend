<script setup>
import CompleteProfileForm from '@/components/Auth/CompleteProfile/CompleteProfileForm.vue'
import { useUserStore } from '@/stores/useUserStore'
const userStore = useUserStore()
</script>
<template>
  <div class="justify-center items-center w-full card lg:flex max-w-md my-8">
    <div class="w-full card-body">
      <router-link :to="{ name: 'HomePage' }" class="py-4 block">
        <h1 class="text-2xl md:text-4xl text-center font-black">LM Academy</h1>
      </router-link>
      <p class="mb-4 text-gray-400 text-sm text-center">Welcome, {{ userStore.userFullName }}</p>
      <!-- form -->
      <CompleteProfileForm />
    </div>
  </div>
</template>
