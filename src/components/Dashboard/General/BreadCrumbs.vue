<script setup>
const props = defineProps({
  courseTitle: {
    type: String,
    default: '',
  },
  courseLink: {
    type: [String, Object],
    default: null,
  },
  moduleTitle: {
    type: String,
    default: '',
  },
  moduleLink: {
    type: [String, Object],
    default: null,
  },
  sectionTitle: {
    type: String,
    default: '',
  },
  sectionLink: {
    type: [String, Object],
    default: null,
  },
})
</script>

<template>
  <nav class="flex flex-wrap items-center gap-1 text-sm text-gray-500">
    <template v-if="props.courseTitle">
      <component
        :is="props.courseLink ? 'router-link' : 'span'"
        class="text-[#1F8EFA] hover:underline"
        v-bind="props.courseLink ? { to: props.courseLink } : {}"
        >{{ props.courseTitle }}
      </component>
      <span v-if="props.moduleTitle || props.sectionTitle">›</span>
    </template>

    <template v-if="props.moduleTitle">
      <component
        :is="props.moduleLink ? 'router-link' : 'span'"
        class="text-[#1F8EFA] hover:underline"
        v-bind="props.moduleLink ? { to: props.moduleLink } : {}"
        >{{ props.moduleTitle }}
      </component>
      <span v-if="props.sectionTitle">›</span>
    </template>

    <template v-if="props.sectionTitle">
      <component
        :is="props.sectionLink ? 'router-link' : 'span'"
        class="text-[#1F8EFA] hover:underline"
        v-bind="props.sectionLink ? { to: props.sectionLink } : {}"
        >{{ props.sectionTitle }}
      </component>
    </template>
  </nav>
</template>
