<template>
  <label class="label-with-hint" :for="forId">
    {{ label }}
    <AppTooltip v-if="hint" :text="hint" />
  </label>
</template>

<script setup>
import AppTooltip from './AppTooltip.vue'

defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  forId: { type: String, default: undefined },
})
</script>
