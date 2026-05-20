<template>
  <span class="app-tooltip" tabindex="0" :aria-label="text">
    <span class="app-tooltip-icon" aria-hidden="true">i</span>
    <span class="app-tooltip-bubble" role="tooltip">{{ text }}</span>
  </span>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
})
</script>
