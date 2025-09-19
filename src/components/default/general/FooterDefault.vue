<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer>
    <div class="footer flex justify-between items-center border-t-4 border-textPrimary py-4">
      <nav class="text-xl flex gap-2">
        <router-link
          :to="{ name: 'PrivacyPolicyPage' }"
          exact-active-class="border-b-textPrimary border-b-2"
          >Privacy Policy</router-link
        >
        |
        <router-link
          :to="{ name: 'TermsOfServicePage' }"
          exact-active-class="border-b-textPrimary border-b-2"
          >Terms of Service</router-link
        >
        |
        <router-link :to="{ name: 'LoginPage' }" active-class="border-b-textPrimary border-b-2"
          >Contact</router-link
        >
      </nav>

      <p class="text-xl">Copyright &copy; {{ currentYear }}</p>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped></style>
