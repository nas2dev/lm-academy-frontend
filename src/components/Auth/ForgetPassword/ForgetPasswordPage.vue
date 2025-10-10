<script setup>
import ForgetPasswordForm from './ForgetPasswordForm.vue'
</script>
<template>
  <div class="justify-center items-center w-full card lg:flex max-w-md">
    <div class="w-full card-body">
      <a href="../" class="py-4 block">
        <h1 class="text-2xl md:text-4xl text-left font-black">Forgot Password</h1>
      </a>
      <p class="mb-4 text-gray-400 text-sm text-left">
        No need to worry! Enter your email address and we'll send a password reset link
      </p>
      <!-- form -->
      <ForgetPasswordForm />
    </div>
  </div>
</template>
