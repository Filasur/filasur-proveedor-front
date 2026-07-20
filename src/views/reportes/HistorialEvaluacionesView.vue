<template>
  <div>
    <h2 class="page-title">Bitácora del sistema</h2>
    <p class="page-subtitle">
      <strong>Aplicación:</strong> acciones de negocio (login, altas, docs…).
      <strong>Auditoría BD:</strong> INSERT/UPDATE/DELETE técnicos vía triggers (bit_*).
      No son duplicados: son dos capas distintas del mismo evento.
    </p>

    <div class="card toolbar-row">
      <div class="field grow">
        <LabelHint label="Buscar" hint="Filtra por acción, detalle o nombre de usuario." />
        <input v-model="busqueda" placeholder="Acción, detalle o usuario..." />
      </div>
      <div class="field">
        <LabelHint label="Origen" hint="Aplicación = Bitacora; Auditoría = tablas bit_*." />
        <select v-model="filtroOrigen">
          <option value="app">Solo aplicación</option>
          <option value="audit">Solo auditoría BD</option>
          <option value="">Todos</option>
        </select>
      </div>
      <div class="field">
        <LabelHint label="Módulo" hint="Área del sistema o tabla auditada." />
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
            <ThHint label="Origen" hint="Aplicación o auditoría de base de datos." />
            <ThHint label="Usuario" hint="Usuario de la app o login SQL." />
            <ThHint label="Módulo" hint="Sección o tabla auditada." />
            <ThHint label="Acción" hint="Qué ocurrió." />
            <ThHint label="Detalle" hint="Resumen legible del evento." />
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in filtrados" :key="h.id">
            <td>{{ h.fecha }}</td>
            <td>
              <span class="origen-badge" :class="h.esAuditoria ? 'origen-audit' : 'origen-app'">
                {{ h.esAuditoria ? 'Auditoría BD' : 'Aplicación' }}
              </span>
            </td>
            <td>{{ h.usuario }}</td>
            <td>{{ h.moduloCorto }}</td>
            <td>{{ h.accion }}</td>
            <td class="detalle-cell">{{ h.detalleLegible }}</td>
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
const filtroOrigen = ref('app')

function esAuditoria(modulo) {
  return String(modulo || '').startsWith('Auditoría')
}

function moduloCorto(modulo) {
  return String(modulo || '').replace(/^Auditoría\s+/i, '') || '—'
}

function detalleLegible(row) {
  const raw = String(row.detalle || '').trim()
  if (!raw) return '—'
  if (!esAuditoria(row.modulo)) return raw

  try {
    const data = JSON.parse(raw)
    if (data.RazonSocial) return `${data.RazonSocial}${data.Ruc ? ` (RUC ${data.Ruc})` : ''}`
    if (data.NombreCompleto) return `${data.NombreCompleto}${data.Email ? ` <${data.Email}>` : ''}`
    if (data.Nombre && data.Codigo) return `${data.Nombre} (${data.Codigo})`
    if (data.Nombre) return data.Nombre
    if (data.IdEvaluacion) return `Evaluación #${data.IdEvaluacion}`
    if (data.IdProveedor) return `Proveedor Id=${data.IdProveedor}`
    if (data.IdUsuario) return `Usuario Id=${data.IdUsuario}`
    if (data.IdRol) return `Rol Id=${data.IdRol}`
  } catch {
    // no JSON
  }
  return raw.length > 180 ? `${raw.slice(0, 180)}…` : raw
}

const enriquecidos = computed(() =>
  historial.value.map((h) => ({
    ...h,
    esAuditoria: esAuditoria(h.modulo),
    moduloCorto: moduloCorto(h.modulo),
    detalleLegible: detalleLegible(h),
  })),
)

const modulosDisponibles = computed(() => {
  const base = enriquecidos.value
    .filter((h) => {
      if (filtroOrigen.value === 'app') return !h.esAuditoria
      if (filtroOrigen.value === 'audit') return h.esAuditoria
      return true
    })
    .map((h) => h.modulo)
    .filter(Boolean)
  return [...new Set(base)].sort((a, b) => a.localeCompare(b, 'es'))
})

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return enriquecidos.value.filter((h) => {
    if (filtroOrigen.value === 'app' && h.esAuditoria) return false
    if (filtroOrigen.value === 'audit' && !h.esAuditoria) return false
    const matchM = !filtroModulo.value || h.modulo === filtroModulo.value
    const matchQ =
      !q ||
      [h.accion, h.detalleLegible, h.usuario, h.modulo, h.moduloCorto].some((v) =>
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
.detalle-cell {
  max-width: 380px;
  word-break: break-word;
  font-size: 13px;
}
.origen-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.origen-app {
  color: #096dd9;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}
.origen-audit {
  color: #595959;
  background: #fafafa;
  border: 1px solid #d9d9d9;
}
</style>
