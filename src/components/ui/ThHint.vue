<template>
  <th>
    <span class="th-hint-wrap">
      {{ label }}
      <AppTooltip v-if="hint" :text="hint" />
    </span>
  </th>
</template>

<script setup>
import AppTooltip from './AppTooltip.vue'

defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
})
</script>
