<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Evaluaciones pendientes</h2>
        <p class="page-subtitle">
          Flujo por partes: Calidad → Compras → Logística. Continúe solo cuando sea el turno de su rol.
        </p>
      </div>
      <RouterLink
        v-if="puedeIniciar"
        :to="{ name: 'nueva-evaluacion' }"
        class="btn btn-primary"
      >
        Nueva evaluación
      </RouterLink>
    </div>

    <div class="card toolbar-row">
      <div class="field">
        <label>Estado</label>
        <select v-model="filtroEstado">
          <option value="mi-turno">Mi turno</option>
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
            <th>Turno actual</th>
            <th>Estado</th>
            <th>Orden compra</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filtrados" :key="e.id">
            <td>{{ e.proveedor }}</td>
            <td>{{ e.producto || '—' }}</td>
            <td>{{ etiquetaTurno(e) }}</td>
            <td><StatusBadge :status="e.estado" /></td>
            <td>{{ e.ordenCompra || '-' }}</td>
            <td class="col-acciones">
              <div class="acciones">
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
              </div>
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
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/security/permissions'
import { puedeIniciarEvaluacion } from '@/utils/areaEvaluacion'
import StatusBadge from '@/components/ui/StatusBadge.vue'

/** Solo estos estados admiten edición de borrador en el asistente. */
const ESTADOS_EDITABLES = new Set(['En proceso', 'En evaluación'])

const auth = useAuthStore()
const evaluaciones = ref([])
const filtroEstado = ref('mi-turno')
const busqueda = ref('')

const puedeIniciar = computed(() => puedeIniciarEvaluacion(auth.user?.rol))
const esAdmin = computed(() => auth.user?.rol === ROLES.admin)

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return evaluaciones.value.filter((e) => {
    let matchE = true
    if (filtroEstado.value === 'mi-turno') {
      matchE = ESTADOS_EDITABLES.has(e.estado) && esMiTurnoItem(e)
    } else if (filtroEstado.value === 'pendientes') {
      matchE = ESTADOS_EDITABLES.has(e.estado)
    } else if (filtroEstado.value) {
      matchE = e.estado === filtroEstado.value
    }
    const matchQ = !q || e.proveedor.toLowerCase().includes(q)
    return matchE && matchQ
  })
})

function esMiTurnoItem(e) {
  if (esAdmin.value) return Boolean(e.rolTurno)
  return e.rolTurno === auth.user?.rol
}

function puedeContinuar(e) {
  return ESTADOS_EDITABLES.has(e.estado) && (esAdmin.value || e.rolTurno === auth.user?.rol)
}

function etiquetaTurno(e) {
  if (!ESTADOS_EDITABLES.has(e.estado)) return '—'
  if (!e.rolTurno) return 'Completa'
  return e.rolTurno
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

.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.field.grow {
  flex: 1;
  min-width: 220px;
}

.col-acciones .acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.link-action {
  color: var(--filasur-primary);
  text-decoration: none;
  font-size: 14px;
}

.link-action:hover {
  text-decoration: underline;
}
</style>
