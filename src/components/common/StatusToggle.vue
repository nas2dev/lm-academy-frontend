<script setup>
const props = defineProps({
  modelValue: {
    type: [Number, Boolean],
    default: 0,
  },
  activeLabel: {
    type: String,
    default: 'Active',
  },
  inactiveLabel: {
    type: String,
    default: 'Inactive',
  },
  activeValue: {
    type: [Number, Boolean],
    default: 1,
  },
  inactiveValue: {
    type: [Number, Boolean],
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isActive = (value) => props.modelValue === value

const setValue = (value) => {
  if (props.disabled || value === props.modelValue) return
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div
    class="inline-flex rounded-md overflow-hidden border border-gray-200 bg-gray-100"
    :class="{ 'opacity-60 pointer-events-none': disabled }"
  >
    <button
      type="button"
      class="px-5 py-2 text-sm font-semibold transition-colors"
      :class="
        isActive(activeValue) ? 'text-white bg-[#4BD08B]' : 'text-gray-500 hover:text-gray-700'
      "
      @click="setValue(activeValue)"
    >
      {{ activeLabel }}
    </button>
    <button
      type="button"
      class="px-5 py-2 text-sm font-semibold transition-colors"
      :class="
        isActive(inactiveValue) ? 'text-white bg-[#D9D9D9]' : 'text-gray-500 hover:text-gray-700'
      "
      @click="setValue(inactiveValue)"
    >
      {{ inactiveLabel }}
    </button>
  </div>
</template>
