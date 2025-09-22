<template>
  <header>
    <div class="flex justify-between items-center border-b-4 border-textPrimary py-4 px-4">
      <!-- Logo -->
      <h1 class="text-3xl md:text-5xl text-textPrimary">LM Academy</h1>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex text-2xl lg:text-3xl gap-2">
        <router-link :to="{ name: 'HomePage' }" exact-active-class="border-b-textPrimary border-b-2"
          >Home</router-link
        >
        |
        <router-link
          :to="{ name: 'AboutPage' }"
          exact-active-class="border-b-textPrimary border-b-2"
          >About Us</router-link
        >
        |
        <router-link :to="{ name: 'LoginPage' }" active-class="border-b-textPrimary border-b-2"
          >Login</router-link
        >
      </nav>

      <!-- Mobile Hamburger Button -->
      <button
        @click="toggleMobileMenu"
        class="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
        aria-label="Toggle mobile menu"
      >
        <span
          class="block w-6 h-0.5 bg-textPrimary transition-all duration-300"
          :class="{ 'rotate-45 translate-y-2': isMobileMenuOpen }"
        ></span>
        <span
          class="block w-6 h-0.5 bg-textPrimary transition-all duration-300"
          :class="{ 'opacity-0': isMobileMenuOpen }"
        ></span>
        <span
          class="block w-6 h-0.5 bg-textPrimary transition-all duration-300"
          :class="{ '-rotate-45 -translate-y-2': isMobileMenuOpen }"
        ></span>
      </button>
    </div>

    <!-- Mobile Navigation Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="closeMobileMenu"
    ></div>

    <!-- Mobile Navigation Menu -->
    <nav
      class="md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
      :class="{ 'translate-x-0': isMobileMenuOpen, 'translate-x-full': !isMobileMenuOpen }"
    >
      <div class="flex flex-col h-full">
        <!-- Close button -->
        <div class="flex justify-end p-4">
          <button
            @click="closeMobileMenu"
            class="text-textPrimary hover:text-gray-600"
            aria-label="Close mobile menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <div class="flex flex-col px-6 py-4 space-y-4">
          <router-link
            :to="{ name: 'HomePage' }"
            @click="closeMobileMenu"
            class="text-2xl text-textPrimary hover:text-gray-600 transition-colors duration-200"
            active-class="text-blue-600 font-semibold"
          >
            Home
          </router-link>

          <router-link
            :to="{ name: 'AboutPage' }"
            @click="closeMobileMenu"
            class="text-2xl text-textPrimary hover:text-gray-600 transition-colors duration-200"
            active-class="text-blue-600 font-semibold"
          >
            About Us
          </router-link>

          <router-link
            :to="{ name: 'LoginPage' }"
            @click="closeMobileMenu"
            class="text-2xl text-textPrimary hover:text-gray-600 transition-colors duration-200"
            active-class="text-blue-600 font-semibold"
          >
            Login
          </router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Close mobile menu on escape key
const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Close mobile menu on window resize to desktop size
const handleResize = () => {
  if (window.innerWidth >= 768 && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Custom scrollbar for mobile menu */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: #f1f1f1;
}

nav::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
