<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Evaluaciones pendientes</h2>
        <p class="page-subtitle">Lista de evaluaciones en curso con filtros por estado</p>
      </div>
      <RouterLink :to="{ name: 'nueva-evaluacion' }" class="btn btn-primary">Nueva evaluación</RouterLink>
    </div>

    <div class="card toolbar-row">
      <div class="field">
        <label>Estado</label>
        <select v-model="filtroEstado">
          <option value="pendientes">Solo pendientes</option>
          <option value="">Todos</option>
          <option value="En proceso">En proceso</option>
          <option value="En evaluación">En evaluación</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Observado">Observado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Finalizada">Finalizada</option>
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
            <td>{{ e.producto || '—' }}</td>
            <td>{{ etiquetaAreas(e) }}</td>
            <td><StatusBadge :status="e.estado" /></td>
            <td>{{ e.ordenCompra || '-' }}</td>
            <td class="acciones">
              <RouterLink
                v-if="puedeContinuar(e)"
                class="link-action"
                :to="{ name: 'nueva-evaluacion', query: { id: e.id } }"
              >
                Continuar
              </RouterLink>
              <RouterLink
                class="link-action"
                :to="{ name: 'consolidacion', query: { id: e.id } }"
              >
                {{ puedeContinuar(e) ? 'Consolidar' : 'Ver' }}
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtrados.length" class="empty-state">No hay evaluaciones con los filtros actuales.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'

/** Solo estos estados admiten edición de borrador en el asistente. */
const ESTADOS_EDITABLES = new Set(['En proceso', 'En evaluación'])

const evaluaciones = ref([])
const filtroEstado = ref('pendientes')
const busqueda = ref('')

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return evaluaciones.value.filter((e) => {
    let matchE = true
    if (filtroEstado.value === 'pendientes') {
      matchE = ESTADOS_EDITABLES.has(e.estado)
    } else if (filtroEstado.value) {
      matchE = e.estado === filtroEstado.value
    }
    const matchQ = !q || e.proveedor.toLowerCase().includes(q)
    return matchE && matchQ
  })
})

function puedeContinuar(e) {
  return ESTADOS_EDITABLES.has(e.estado)
}

function etiquetaAreas(e) {
  if (!e.areasPendientes) return 'Completa'
  return `${e.areasPendientes} área(s)`
}

onMounted(async () => {
  evaluaciones.value = await api.evaluaciones.listar()
})
</script>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}
.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}
</style>
