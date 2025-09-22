<script setup>
defineProps({
  path: {
    type: String,
    required: false,
    default: 'HomePage',
  },
  pageTitle: {
    type: String,
    required: false,
    default: 'Home',
  },
})
</script>
<template>
  <div class="flex justify-center gap-2 items-center">
    <p class="text-base font-semibold text-gray-400">Go to</p>
    <router-link
      :to="{ name: path }"
      class="text-sm font-semibold text-authBlue hover:text-blue-700"
      >{{ pageTitle }}
    </router-link>
  </div>
</template>
