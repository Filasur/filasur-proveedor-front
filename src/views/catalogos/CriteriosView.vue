<template>
  <div>
    <h2 class="page-title">Criterios de evaluación</h2>
    <p class="page-subtitle">Configuración de criterios y pesos por área evaluadora</p>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Criterio</th>
            <th>Área</th>
            <th>Peso (%)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in criterios" :key="c.id">
            <td>{{ c.nombre }}</td>
            <td>{{ c.area }}</td>
            <td>{{ c.peso }}%</td>
            <td><StatusBadge :status="c.activo ? 'Activo' : 'Inactivo'" /></td>
          </tr>
        </tbody>
      </table>
      <p class="hint">Los criterios se administran desde el módulo de configuración cuando el backend esté listo.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const criterios = ref([])
onMounted(async () => {
  criterios.value = await api.criterios.listar()
})
</script>

<style scoped>
.hint { margin-top: 16px; font-size: 13px; color: var(--filasur-muted); }
</style>
