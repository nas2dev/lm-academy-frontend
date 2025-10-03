<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'HomePage' })
}

const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="card">
        <div class="card-body text-center">
          <!-- 404 Icon -->
          <div class="mb-6">
            <div
              class="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4"
            >
              <i class="ti ti-alert-circle text-5xl text-red-500"></i>
            </div>
          </div>

          <!-- Error Code -->
          <h1 class="text-6xl font-bold text-gray-500 mb-4">404</h1>

          <!-- Error Title -->
          <h2 class="text-2xl font-semibold text-gray-500 mb-3">Page Not Found</h2>

          <!-- Error Description -->
          <p class="text-gray-400 text-base mb-8 leading-relaxed">
            Sorry, the page you are looking for doesn't exist or has been moved. Let's get you back
            on track.
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              @click="goHome"
              class="btn flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <i class="ti ti-home text-lg"></i>
              <span>Go Home</span>
            </button>

            <button
              @click="goBack"
              class="btn-outline-primary flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <i class="ti ti-arrow-left text-lg"></i>
              <span>Go Back</span>
            </button>
          </div>

          <!-- Additional Help -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-400 mb-3">Need help?</p>
            <div class="flex justify-center gap-4 text-sm">
              <router-link
                :to="{ name: 'ContactPage' }"
                class="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <i class="ti ti-mail text-sm"></i>
                <span>Contact Support</span>
              </router-link>

              <router-link
                :to="{ name: 'AboutPage' }"
                class="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <i class="ti ti-info-circle text-sm"></i>
                <span>About Us</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
