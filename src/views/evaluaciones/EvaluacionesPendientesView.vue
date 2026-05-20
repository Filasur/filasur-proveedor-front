<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Evaluaciones pendientes</h2>
        <p class="page-subtitle">Lista de evaluaciones en curso con filtros por estado</p>
      </div>
      <RouterLink :to="{ name: 'nueva-evaluacion' }" class="btn btn-primary">+ Nueva evaluación</RouterLink>
    </div>

    <div class="card toolbar-row">
      <div class="field">
        <label>Estado</label>
        <select v-model="filtroEstado">
          <option value="">Todos</option>
          <option value="En proceso">En proceso</option>
          <option value="En evaluación">En evaluación</option>
        </select>
      </div>
      <div class="field grow">
        <label>Buscar proveedor</label>
        <input v-model="busqueda" placeholder="Nombre del proveedor..." />
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Producto / Material</th>
            <th>Áreas pendientes</th>
            <th>Estado</th>
            <th>Orden compra</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filtrados" :key="e.id">
            <td>{{ e.proveedor }}</td>
            <td>{{ e.producto }}</td>
            <td>{{ e.areasPendientes }} área(s)</td>
            <td><StatusBadge :status="e.estado" /></td>
            <td>{{ e.ordenCompra || '-' }}</td>
            <td>
              <RouterLink class="link-action" :to="{ name: 'nueva-evaluacion', query: { id: e.id } }">Continuar</RouterLink>
              &nbsp;|&nbsp;
              <RouterLink class="link-action" :to="{ name: 'consolidacion', query: { id: e.id } }">Consolidar</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtrados.length" class="empty-state">No hay evaluaciones pendientes.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const evaluaciones = ref([])
const filtroEstado = ref('')
const busqueda = ref('')

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return evaluaciones.value.filter((e) => {
    const matchE = !filtroEstado.value || e.estado === filtroEstado.value
    const matchQ = !q || e.proveedor.toLowerCase().includes(q)
    return matchE && matchQ
  })
})

onMounted(async () => {
  evaluaciones.value = await api.evaluaciones.listar({ pendientes: true })
})
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.page-head .page-subtitle { margin-bottom: 16px; }
</style>
