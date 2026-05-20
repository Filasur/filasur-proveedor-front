<template>
  <span class="badge" :class="variant">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const map = {
  Aprobado: 'success',
  'Proveedor aprobado': 'success',
  Activo: 'success',
  A: 'success',
  Finalizada: 'success',
  Observado: 'warning',
  'En evaluación': 'info',
  'En revisión': 'info',
  'En proceso': 'info',
  B: 'info',
  Rechazado: 'danger',
  Inactivo: 'muted',
  C: 'danger',
}

const variant = computed(() => map[props.status] || 'muted')
const label = computed(() => props.status)
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.badge.success { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f; }
.badge.warning { background: #fffbe6; color: #d48806; border: 1px solid #ffe58f; }
.badge.info { background: #e6f7ff; color: #096dd9; border: 1px solid #91d5ff; }
.badge.danger { background: #fff2f0; color: #cf1322; border: 1px solid #ffa39e; }
.badge.muted { background: #fafafa; color: #595959; border: 1px solid #d9d9d9; }
</style>
