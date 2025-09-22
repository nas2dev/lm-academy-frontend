<script setup>
import { onMounted, ref } from 'vue'

const quote = ref('')
const author = ref('')

const fetchZenQuoteApi = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/zen-quote')
    const data = await response.json()

    if (data.success) {
      quote.value = data.quote.text
      author.value = data.quote.author
    } else {
      quote.value = "The world would go on even without you. Don't take yourself so seriously."
      author.value = 'Norman Vincent Peale'
    }
  } catch (error) {
    console.log('Error fetching Zen quote', error)
  }
}

onMounted(() => {
  fetchZenQuoteApi()
})
</script>

<template>
  <div class="h-full flex flex-col justify-around">
    <div class="flex justify-center">
      <div class="w-[250px] md:w-[500px] text-center">
        <h1 class="text-3xl">
          Welcome to <strong>Learn More Academy</strong> Empowering Students with the Skills of
          Tomorrow
        </h1>
      </div>
    </div>

    <div class="flex justify-end">
      <div class="w-[250px] md:w-[500px] text-end space-y-4 text-2xl">
        <h1 class="italic font-gelasio text-[#003366]">
          {{ quote || 'Loading...' }}
        </h1>
        <p class="text-[#8694A9]">
          {{ author || 'Unknown' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style></style>
