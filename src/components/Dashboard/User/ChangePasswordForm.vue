<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
</script>

<template>
  <div class="card">
    <div class="card-body">
      <Form v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)" class="space-y-6 max-w-xl mx-auto"></form>
      </Form>
    </div>
  </div>
</template>
