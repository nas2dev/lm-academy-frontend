<script setup>
import RegisterForm from '@/components/Auth/Register/RegisterForm.vue'
</script>
<template>
  <div class="justify-center items-center w-full card lg:flex max-w-md">
    <div class="w-full card-body">
      <router-link :to="{ name: 'HomePage' }" class="py-4 block">
        <h1 class="text-2xl md:text-4xl text-center font-black">LM Academy</h1>
      </router-link>
      <p class="mb-4 text-gray-400 text-sm text-center">Fill out your data</p>
      <!-- form -->
      <RegisterForm />
    </div>
  </div>
</template>
