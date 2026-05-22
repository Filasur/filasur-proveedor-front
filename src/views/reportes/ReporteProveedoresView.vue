<template>
  <div>
    <h2 class="page-title">Reporte de proveedores</h2>
    <p class="page-subtitle">Listado y estadísticas de proveedores registrados</p>

    <div class="kpi-row kpi-row--3">
      <article class="card kpi-mini"><span>Total registrados</span><strong>{{ proveedores.length }}</strong></article>
      <article class="card kpi-mini"><span>Aprobados</span><strong>{{ conteo('Aprobado') }}</strong></article>
      <article class="card kpi-mini"><span>En evaluación</span><strong>{{ conteo('En evaluación') }}</strong></article>
    </div>

    <div class="card toolbar-row">
      <div class="field grow">
        <LabelHint label="Buscar" />
        <input v-model="busqueda" placeholder="RUC, razón social o rubro..." />
      </div>
      <div class="field">
        <LabelHint label="Estado" />
        <select v-model="filtroEstado">
          <option value="">Todos</option>
          <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
      <div class="field">
        <LabelHint label="Clasificación" />
        <select v-model="filtroClase">
          <option value="">Todas (A / B / C)</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>
      <button type="button" class="btn btn-primary" @click="exportar">Exportar</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="RUC" />
            <ThHint label="Razón social" />
            <ThHint label="Tipo" />
            <ThHint label="Rubro" />
            <ThHint label="Puntaje promedio" hint="Promedio de evaluaciones en escala 0 a 5." />
            <ThHint label="Clasificación" hint="Categoría A/B/C según el puntaje promedio." />
            <ThHint label="Evaluaciones" hint="Cantidad de evaluaciones consideradas." />
            <ThHint label="Estado" />
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtrados" :key="p.id">
            <td>{{ p.ruc }}</td>
            <td>{{ p.razonSocial }}</td>
            <td>{{ p.tipoProveedor }}</td>
            <td>{{ p.rubro }}</td>
            <td>{{ formatPuntaje(p.puntajePromedio) }}</td>
            <td><StatusBadge :status="p.clasificacion" /></td>
            <td>{{ formatEvaluaciones(p.evaluaciones) }}</td>
            <td><StatusBadge :status="p.estado" /></td>
            <td>
              <RouterLink class="link-action" :to="{ name: 'detalle-proveedor', params: { id: p.id } }">
                Ver detalle
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtrados.length" class="empty-state">Sin proveedores con los filtros actuales.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import { confirmAction, toastInfo } from '@/utils/alerts'

const proveedores = ref([])
const busqueda = ref('')
const filtroEstado = ref('')
const filtroClase = ref('')

const estados = computed(() => [...new Set(proveedores.value.map((p) => p.estado))].sort())

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  const lista = proveedores.value.filter((p) => {
    const matchEstado = !filtroEstado.value || p.estado === filtroEstado.value
    const matchClase = !filtroClase.value || p.clasificacion === filtroClase.value
    const matchQ =
      !q ||
      [p.ruc, p.razonSocial, p.rubro, p.tipoProveedor].some((v) => v.toLowerCase().includes(q))
    return matchEstado && matchClase && matchQ
  })
  return [...lista].sort((a, b) => (b.puntajePromedio ?? -1) - (a.puntajePromedio ?? -1))
})

function formatPuntaje(val) {
  if (val == null || Number.isNaN(Number(val))) return '—'
  return `${Number(val).toFixed(2)} / 5.00`
}

function formatEvaluaciones(val) {
  if (val == null || val === '') return '—'
  return val
}

function conteo(estado) {
  return proveedores.value.filter((p) => p.estado === estado).length
}

async function exportar() {
  const ok = await confirmAction({
    title: 'Exportar reporte',
    text: 'Se generará el reporte de proveedores con los filtros actuales. ¿Continuar?',
    icon: 'info',
    confirmText: 'Exportar',
  })
  if (!ok) return
  toastInfo('Exportación PDF/Excel disponible cuando se conecte el backend.')
}

onMounted(async () => {
  proveedores.value = await api.proveedores.listar()
})
</script>
