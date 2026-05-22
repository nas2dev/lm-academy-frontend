<script setup>
defineProps({
  greeting: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div class="welcome-banner card overflow-hidden">
    <div class="card-body relative z-[1]">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-500 mb-1">
            {{ greeting }}, {{ firstName }}! 👋
          </h2>
          <p class="text-gray-400 text-sm" v-if="isUser">
            Keep learning, keep growing. Your next lesson awaits!
          </p>
          <p class="text-gray-400 text-sm" v-else-if="isAdmin">
            Here's what's happening on your platform today.
          </p>
        </div>
        <div class="hidden lg:flex items-center">
          <div class="welcome-icon-wrapper">
            <i class="ti ti-school text-4xl text-blue-600 opacity-60"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="welcome-bg-accent"></div>
  </div>
</template>

<style scoped>
/* Welcome Banner styles from parent */
.welcome-banner {
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(0, 133, 219, 0.05);
  pointer-events: none;
}

.welcome-banner::after {
  content: '';
  position: absolute;
  bottom: -60%;
  right: 10%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(75, 208, 139, 0.05);
  pointer-events: none;
}

.welcome-bg-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 40%;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 133, 219, 0.03) 100%);
  pointer-events: none;
}

.welcome-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(0, 133, 219, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
