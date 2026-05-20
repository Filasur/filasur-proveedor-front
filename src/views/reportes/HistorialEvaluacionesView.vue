<template>
  <div>
    <h2 class="page-title">Historial de evaluaciones</h2>
    <p class="page-subtitle">Trazabilidad completa de acciones en el sistema</p>

    <div class="card toolbar-row">
      <div class="field grow">
        <label>Buscar</label>
        <input v-model="busqueda" placeholder="Acción, detalle o usuario..." />
      </div>
      <div class="field">
        <label>Módulo</label>
        <select v-model="filtroModulo">
          <option value="">Todos</option>
          <option value="Evaluaciones">Evaluaciones</option>
          <option value="Proveedores">Proveedores</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Módulo</th>
            <th>Acción</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in filtrados" :key="h.id">
            <td>{{ h.fecha }}</td>
            <td>{{ h.usuario }}</td>
            <td>{{ h.modulo }}</td>
            <td>{{ h.accion }}</td>
            <td>{{ h.detalle }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtrados.length" class="empty-state">Sin resultados.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'

const historial = ref([])
const busqueda = ref('')
const filtroModulo = ref('')

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return historial.value.filter((h) => {
    const matchM = !filtroModulo.value || h.modulo === filtroModulo.value
    const matchQ =
      !q ||
      [h.accion, h.detalle, h.usuario].some((v) => v.toLowerCase().includes(q))
    return matchM && matchQ
  })
})

onMounted(async () => {
  historial.value = await api.historial.listar()
})
</script>
