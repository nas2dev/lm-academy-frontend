<script setup>
import { computed } from 'vue'
import SimpleModal from '@/components/Dashboard/General/SimpleModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  currentStatus: {
    type: Number,
    required: true, // 1 for active, 0 for inactive
  },
})

const emit = defineEmits(['confirm', 'close'])

const isActivating = computed(() => props.currentStatus === 0)
const actionText = computed(() => (isActivating.value ? 'activate' : 'deactivate'))
const buttonText = computed(() => (isActivating.value ? 'Activate' : 'Deactivate'))
const modalTitle = computed(() => `Are you sure you want to (${actionText.value}) this user?`)

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <SimpleModal
    :isOpen="isOpen"
    :title="modalTitle"
    @confirm="handleConfirm"
    @close="$emit('close')"
  >
    <template #body>
      <div class="text-center">
        <p class="text-gray-600">
          If you want to {{ actionText }} this user, click on the button below.
        </p>
      </div>
    </template>

    <template #footer>
      <button
        @click="handleConfirm"
        :class="[
          'px-12 py-3 text-white rounded-full font-medium transition-colors',
          isActivating ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600',
        ]"
      >
        {{ buttonText }}
      </button>
    </template>
  </SimpleModal>
</template>
