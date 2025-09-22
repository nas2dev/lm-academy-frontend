<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <footer>
    <div class="footer border-t-4 border-textPrimary py-4 px-4">
      <!-- Desktop Layout: Horizontal -->
      <div class="hidden md:flex justify-between items-center">
        <nav class="text-xl flex gap-2">
          <router-link
            :to="{ name: 'PrivacyPolicyPage' }"
            exact-active-class="border-b-textPrimary border-b-2"
            @click="scrollToTop"
            >Privacy Policy</router-link
          >
          |
          <router-link
            :to="{ name: 'TermsOfServicePage' }"
            exact-active-class="border-b-textPrimary border-b-2"
            @click="scrollToTop"
            >Terms of Service</router-link
          >
          |
          <router-link
            :to="{ name: 'ContactPage' }"
            active-class="border-b-textPrimary border-b-2"
            @click="scrollToTop"
            >Contact</router-link
          >
        </nav>

        <p class="text-xl">Copyright &copy; {{ currentYear }}</p>
      </div>

      <!-- Mobile Layout: Stacked -->
      <div class="md:hidden flex flex-col items-center space-y-4">
        <nav class="text-lg flex flex-col items-center space-y-2">
          <router-link
            :to="{ name: 'PrivacyPolicyPage' }"
            exact-active-class="border-b-textPrimary border-b-2"
            class="hover:text-gray-600 transition-colors duration-200"
            @click="scrollToTop"
            >Privacy Policy</router-link
          >
          <router-link
            :to="{ name: 'TermsOfServicePage' }"
            exact-active-class="border-b-textPrimary border-b-2"
            class="hover:text-gray-600 transition-colors duration-200"
            @click="scrollToTop"
            >Terms of Service</router-link
          >
          <router-link
            :to="{ name: 'ContactPage' }"
            active-class="border-b-textPrimary border-b-2"
            class="hover:text-gray-600 transition-colors duration-200"
            @click="scrollToTop"
            >Contact</router-link
          >
        </nav>

        <p class="text-sm text-center text-gray-600">Copyright &copy; {{ currentYear }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped></style>
