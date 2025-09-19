<template>
  <div class="absolute bottom-0 left-0 ml-[25px] mb-[21px]">
    <div class="flex gap-3 text-[#0085DB]">
      <router-link :to="{ name: 'LoginPage' }">Privacy Policy</router-link>
      <router-link :to="{ name: 'RegisterPage' }">Terms of Service</router-link>
    </div>
  </div>
</template>

<style scoped>
a {
  color: #0085db;
  margin-left: 25px;
  margin-bottom: 21px;
}
</style>
