<template>
  <div>
    <h2 class="page-title">Bitácora del sistema</h2>
    <p class="page-subtitle">
      Acciones de negocio del portal: quién hizo qué (login, evaluaciones por fase, documentos, altas, etc.).
    </p>

    <div class="card toolbar-row">
      <div class="field grow">
        <LabelHint label="Buscar" hint="Filtra por acción, detalle o nombre de usuario." />
        <input v-model="busqueda" placeholder="Acción, detalle o usuario..." />
      </div>
      <div class="field">
        <LabelHint label="Módulo" hint="Área del sistema donde ocurrió la acción." />
        <select v-model="filtroModulo">
          <option value="">Todos</option>
          <option v-for="m in modulosDisponibles" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Fecha" hint="Momento del evento." />
            <ThHint label="Usuario" hint="Persona que realizó la acción en la aplicación." />
            <ThHint label="Módulo" hint="Sección del sistema." />
            <ThHint label="Acción" hint="Qué ocurrió (ej. fase enviada)." />
            <ThHint label="Detalle" hint="Contexto del evento (evaluación, proveedor, etc.)." />
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in filtrados" :key="h.id">
            <td>{{ h.fecha }}</td>
            <td>{{ h.usuario }}</td>
            <td>{{ h.modulo || '—' }}</td>
            <td>{{ h.accion }}</td>
            <td class="detalle-cell">{{ h.detalle || '—' }}</td>
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

/** Solo bitácora de aplicación (no auditoría técnica bit_*). */
function esAplicacion(row) {
  return !String(row.modulo || '').startsWith('Auditoría')
}

const soloApp = computed(() => historial.value.filter(esAplicacion))

const modulosDisponibles = computed(() => {
  const mods = soloApp.value.map((h) => h.modulo).filter(Boolean)
  return [...new Set(mods)].sort((a, b) => a.localeCompare(b, 'es'))
})

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  return soloApp.value.filter((h) => {
    const matchM = !filtroModulo.value || h.modulo === filtroModulo.value
    const matchQ =
      !q ||
      [h.accion, h.detalle, h.usuario, h.modulo].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(q),
      )
    return matchM && matchQ
  })
})

onMounted(async () => {
  historial.value = await api.bitacora.listar()
})
</script>

<style scoped>
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

.detalle-cell {
  max-width: 420px;
  word-break: break-word;
  font-size: 13px;
}
</style>
