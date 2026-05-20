<template>
  <div>
    <h2 class="page-title">Reporte de evaluaciones</h2>
    <p class="page-subtitle">Consulta y exportación de evaluaciones finalizadas</p>

    <div class="kpi-row">
      <article class="card kpi-mini"><span>Aprobados</span><strong>{{ stats.aprobados }}</strong></article>
      <article class="card kpi-mini"><span>Observados</span><strong>{{ stats.observados }}</strong></article>
      <article class="card kpi-mini"><span>Rechazados</span><strong>{{ stats.rechazados }}</strong></article>
      <article class="card kpi-mini"><span>Total</span><strong>{{ stats.total }}</strong></article>
    </div>

    <div class="card toolbar-row">
      <div class="field">
        <LabelHint label="Rango de fechas" />
        <input value="01/04/2025 - 31/05/2025" readonly />
      </div>
      <div class="field">
        <LabelHint label="Producto / Material" />
        <select v-model="filtroProducto">
          <option value="Todos">Todos</option>
          <option v-for="p in productosUnicos" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div class="field">
        <LabelHint label="Estado" />
        <select v-model="filtroEstado" @change="cargar">
          <option value="Todos">Todos</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Observado">Observado</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>
      <button type="button" class="btn btn-primary" @click="exportar">Exportar</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Proveedor" />
            <ThHint label="Producto / Material" />
            <ThHint label="Fecha evaluación" />
            <ThHint label="Puntaje final" />
            <ThHint label="Estado" />
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filas" :key="r.id">
            <td>{{ r.proveedor }}</td>
            <td>{{ r.producto }}</td>
            <td>{{ r.fechaEvaluacion }}</td>
            <td>{{ r.puntajeFinal }}</td>
            <td><StatusBadge :status="r.estado" /></td>
            <td>
              <RouterLink class="link-action" :to="{ name: 'consolidacion', query: { id: r.id } }">Ver</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filas.length" class="empty-state">Sin evaluaciones con los filtros actuales.</p>
      <div v-else class="pagination">
        <span>Mostrando {{ filas.length }} de {{ stats.total }} resultados</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import { confirmAction, toastInfo } from '@/utils/alerts'

const stats = ref({ total: 0, aprobados: 0, observados: 0, rechazados: 0 })
const filas = ref([])
const todasFilas = ref([])
const filtroEstado = ref('Todos')
const filtroProducto = ref('Todos')

const productosUnicos = computed(() => {
  const set = new Set(todasFilas.value.map((f) => f.producto))
  return [...set].sort()
})

function aplicarFiltroProducto(lista) {
  todasFilas.value = lista
  filas.value =
    filtroProducto.value === 'Todos' ? lista : lista.filter((f) => f.producto === filtroProducto.value)
}

watch(filtroProducto, () => aplicarFiltroProducto(todasFilas.value))

async function cargar() {
  const data = await api.reportes.listar({ estado: filtroEstado.value })
  stats.value = data
  aplicarFiltroProducto(data.filas)
}

async function exportar() {
  const ok = await confirmAction({
    title: 'Exportar reporte',
    text: 'Se generará el reporte de evaluaciones con los filtros actuales. ¿Continuar?',
    icon: 'info',
    confirmText: 'Exportar',
  })
  if (!ok) return
  toastInfo('Exportación PDF/Excel disponible cuando se conecte el backend.')
}

onMounted(cargar)
</script>
