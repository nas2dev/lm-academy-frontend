<script setup></script>

<template>
  <div class="pt-8">
    <div class="mx-auto lg:px-8">
      <h1 class="md:text-3xl text-2xl font-bold text-left ml-5 mb-8">Contact</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Address Section -->
        <div class="rounded-lg p-6">
          <h2 class="bg-white font-semibold mb-4 md:text-2xl text-xl p-2">Address</h2>
          <div class="w-full mb-8">
            <iframe
              class="min-h-96"
              width="100%"
              height="auto"
              frameborder="0"
              scrolling="no"
              marginheight="0"
              marginwidth="0"
              src="https://maps.google.com/maps?width=100%25&amp;height=auto&amp;hl=en&amp;q=+(Coding%20Training%20Academy)&amp;t=k&amp;z=17&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
            ></iframe>
          </div>
          <div class="text-black">
            <p class="font-medium md:text-3xl text-xl mb-2">Vushtrri</p>
            <p class="md:text-2xl text-xl">42000</p>
          </div>
        </div>

        <!-- Opening Hours Section -->
        <div class="rounded-lg p-6">
          <h2 class="bg-white font-semibold mb-4 md:text-2xl text-xl p-2">Opening Hours</h2>
          <div class="space-y-3 px-2">
            <div class="flex justify-between">
              <span class="text-black text-xl md:text-2xl font-medium">Monday</span>
              <span class="text-black text-xl md:text-2xl">07:00 - 21:30</span>
            </div>
            <div class="flex justify-between">
              <span class="text-black text-xl md:text-2xl font-medium">Tuesday</span>
              <span class="text-black text-xl md:text-2xl">07:00 - 21:30</span>
            </div>
            <div class="flex justify-between">
              <span class="text-black text-xl md:text-2xl font-medium">Wednesday</span>
              <span class="text-black text-xl md:text-2xl">07:00 - 21:30</span>
            </div>
            <div class="flex justify-between">
              <span class="text-black text-xl md:text-2xl font-medium">Thursday</span>
              <span class="text-black text-xl md:text-2xl">07:00 - 21:30</span>
            </div>
            <div class="flex justify-between">
              <span class="text-black text-xl md:text-2xl font-medium">Friday</span>
              <span class="text-black text-xl md:text-2xl">07:00 - 21:30</span>
            </div>
            <div class="flex justify-between">
              <span class="text-black text-xl md:text-2xl font-medium">Saturday</span>
              <span class="text-black text-xl md:text-2xl">07:00 - 21:30</span>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="rounded-lg p-6">
          <h2 class="bg-white font-semibold mb-4 md:text-2xl text-xl p-2">Contact</h2>
          <div class="space-y-4">
            <div>
              <p class="text-black text-xl md:text-2xl">
                <span class="font-medium md:text-2xl text-xl">Tel:</span> +383 (0) 44 472 409
              </p>
            </div>
            <div>
              <p class="text-black text-lg md:text-2xl break-words">
                <span class="font-medium">e-mail:</span> codingtrainingacademy@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
iframe {
  height: auto !important;
}
</style>
