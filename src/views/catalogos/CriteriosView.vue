<template>
  <div>
    <h2 class="page-title">Criterios de evaluación</h2>
    <p class="page-subtitle">Configuración de criterios y pesos por área evaluadora</p>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Criterio" hint="Nombre del aspecto a evaluar." />
            <ThHint label="Área" hint="Departamento que califica este criterio." />
            <ThHint label="Peso (%)" hint="Influencia en el puntaje final (suma 100% entre criterios activos)." />
            <ThHint label="Estado" hint="Si el criterio está activo en nuevas evaluaciones." />
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
      <p class="hint">
        Para modificar los pesos (%) o activar/desactivar criterios, vaya a
        <RouterLink :to="{ name: 'configuracion' }">Configuración</RouterLink>
        → sección <strong>Criterios y pesos</strong>.
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ThHint from '@/components/ui/ThHint.vue'

const criterios = ref([])
onMounted(async () => {
  criterios.value = await api.criterios.listar()
})
</script>

<style scoped>
.hint {
  margin-top: 16px;
  font-size: 13px;
  color: var(--filasur-muted);
}
.hint a {
  color: var(--filasur-primary);
  font-weight: 500;
}
</style>
