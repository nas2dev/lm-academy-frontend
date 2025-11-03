<script setup>
import SimpleModal from '@/components/Dashboard/General/SimpleModal.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  newRole: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['confirm', 'close'])

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <SimpleModal
    :isOpen="isOpen"
    title="Are you sure you want to (change) role for this user?"
    @confirm="handleConfirm"
    @close="$emit('close')"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-gray-600">
          If you want to change role for this user, click on the button below. The user's role will
          be updated to: [{{ newRole }}].
        </p>
        <p class="text-gray-600">
          <span class="font-semibold text-orange-600">Warning: </span>Changing the user's role may
          impact their access to certain activities and permissions associated with their current
          role.
        </p>
      </div>
    </template>

    <template #footer>
      <button
        @click="handleConfirm"
        class="px-12 py-3 bg-[#F8C076] text-white rounded-full hover:bg-[#F8C076]/90 transition-colors font-medium"
      >
        Change Role
      </button>
    </template>
  </SimpleModal>
</template>
