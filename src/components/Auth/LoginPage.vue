<script setup>
import LoginForm from '@/components/Auth/Login/LoginForm.vue'
</script>
<template>
  <div class="justify-center items-center w-full card lg:flex max-w-md">
    <div class="w-full card-body">
      <a href="../" class="py-4 block">
        <h1 class="text-2xl md:text-4xl text-center font-black">LM Academy</h1>
      </a>
      <p class="mb-4 text-gray-400 text-sm text-center">Welcome Back</p>
      <!-- form -->
      <LoginForm />
    </div>
  </div>
</template>
