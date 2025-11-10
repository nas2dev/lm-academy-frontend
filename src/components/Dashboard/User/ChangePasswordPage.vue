<script setup>
import ChangePasswordForm from '@/components/Dashboard/User/ChangePasswordForm.vue'
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-xl font-semibold">Update Your Password</h2>
      <router-link
        :to="{ name: 'UserProfilePage' }"
        class="flex justify-end text-sm hover:text-blue-600 mr-3 mb-1 text-authBlue font-semibold"
      >
        to profile</router-link
      >
    </div>
    <ChangePasswordForm />
  </div>
</template>
