<template>
  <div>
    <h2 class="page-title">Bitácora del sistema</h2>
    <p class="page-subtitle">Registro de acciones realizadas sobre proveedores y evaluaciones</p>

    <div class="card toolbar-row">
      <div class="field grow">
        <LabelHint label="Buscar" hint="Filtra por acción, detalle o nombre de usuario." />
        <input v-model="busqueda" placeholder="Acción, detalle o usuario..." />
      </div>
      <div class="field">
        <LabelHint label="Módulo" hint="Área del sistema donde ocurrió la acción." />
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
            <ThHint label="Fecha" hint="Momento en que se registró el evento." />
            <ThHint label="Usuario" hint="Persona que realizó la acción." />
            <ThHint label="Módulo" hint="Sección del sistema (Evaluaciones, Proveedores, etc.)." />
            <ThHint label="Acción" hint="Tipo de operación (crear, aprobar, editar...)." />
            <ThHint label="Detalle" hint="Descripción adicional del registro." />
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
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'

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
  historial.value = await api.bitacora.listar()
})
</script>
