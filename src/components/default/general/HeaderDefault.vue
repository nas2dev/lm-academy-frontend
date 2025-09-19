<template>
  <header>
    <div class="flex justify-between items-center border-b-4 border-textPrimary py-4">
      <h1 class="text-5xl text-textPrimary">LM Academy</h1>
      <nav class="text-3xl flex gap-2">
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
    </div>
  </header>
</template>

<script setup></script>

<style scoped></style>
