<script setup>
import ResetPasswordForm from '@/components/Auth/ResetPassword/ResetPasswordForm.vue'
</script>

<template>
  <div class="justify-center items-center w-full card lg:flex max-w-md">
    <div class="w-full card-body">
      <a href="../" class="py-4 block">
        <h1 class="text-2xl md:text-3xl text-left font-black">Create New Password</h1>
      </a>
      <p class="mb-4 text-gray-400 text-sm text-left">
        Please enter your password, and confirm it. You will need to log in after resetting.
      </p>
      <!-- form -->
      <ResetPasswordForm />
    </div>
  </div>
</template>
