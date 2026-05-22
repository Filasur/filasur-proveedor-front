<template>
  <div>
    <h2 class="page-title">Reporte de desempeño</h2>
    <p class="page-subtitle">Indicadores globales y evolución del sistema de evaluación</p>

    <div class="kpi-row">
      <article class="card kpi-mini">
        <span>Puntaje promedio global</span>
        <strong>{{ puntajePromedioPct }}</strong>
      </article>
      <article class="card kpi-mini">
        <span>Evaluaciones finalizadas</span>
        <strong>{{ resumen?.evaluacionesFinalizadas ?? 0 }}</strong>
      </article>
      <article class="card kpi-mini">
        <span>En proceso</span>
        <strong>{{ resumen?.evaluacionesEnProceso ?? 0 }}</strong>
      </article>
      <article class="card kpi-mini">
        <span>Proveedores activos</span>
        <strong>{{ resumen?.proveedoresActivos ?? 0 }}</strong>
      </article>
    </div>

    <div class="desempeno-grid">
      <section class="card">
        <h3 class="section-title">Distribución por clasificación</h3>
        <table class="data-table">
          <thead>
            <tr>
              <ThHint label="Clasificación" hint="Nivel A, B o C según evaluaciones." />
              <ThHint label="Cantidad" hint="Proveedores en cada categoría." />
              <ThHint label="%" hint="Porcentaje del total registrado." />
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in distribucionClase" :key="row.clase">
              <td><StatusBadge :status="row.clase" /></td>
              <td>{{ row.cantidad }}</td>
              <td>{{ row.porcentaje }}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card">
        <h3 class="section-title">Evolución mensual (puntaje %)</h3>
        <ul v-if="meses.length" class="mes-list">
          <li v-for="(mes, i) in meses" :key="mes">
            <span>{{ mes }}</span>
            <div class="mes-bar-wrap">
              <div class="mes-bar" :style="{ width: `${chartScores[i]}%` }"></div>
            </div>
            <strong>{{ chartScores[i] }}%</strong>
          </li>
        </ul>
        <p v-else class="empty-state">
          Sin evaluaciones finalizadas en los últimos 6 meses para graficar evolución.
        </p>
      </section>
    </div>

    <section class="card">
      <h3 class="section-title">Evaluaciones por estado (sistema)</h3>
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Estado" />
            <ThHint label="Cantidad" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(label, i) in chartEstados.labels" :key="label">
            <td>{{ label }}</td>
            <td>{{ chartEstados.values[i] }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <div class="page-actions">
      <button type="button" class="btn btn-primary" @click="exportar">Exportar</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ThHint from '@/components/ui/ThHint.vue'
import { confirmAction, toastInfo } from '@/utils/alerts'

const resumen = ref(null)
const chartEstados = ref({ labels: [], values: [] })
const meses = ref([])
const chartScores = ref([])
const proveedores = ref([])

/** Puntaje promedio de proveedores está en escala 0-5 → se muestra como % (×20). */
const puntajePromedioPct = computed(() => {
  const p = Number(resumen.value?.puntajePromedio)
  if (!Number.isFinite(p)) return '—'
  return `${Math.round(p * 20)}%`
})

const distribucionClase = computed(() => {
  const total = proveedores.value.length || 1
  return ['A', 'B', 'C'].map((clase) => {
    const cantidad = proveedores.value.filter((p) => p.clasificacion === clase).length
    return {
      clase,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100),
    }
  })
})

async function exportar() {
  const ok = await confirmAction({
    title: 'Exportar reporte',
    text: 'Se generará el reporte de desempeño. ¿Continuar?',
    icon: 'info',
    confirmText: 'Exportar',
  })
  if (!ok) return
  toastInfo('Exportación PDF/Excel disponible cuando se conecte el backend.')
}

onMounted(async () => {
  const [dashboard, listaProveedores] = await Promise.all([
    api.dashboard.getResumen(),
    api.proveedores.listar(),
  ])
  resumen.value = dashboard.resumen
  chartEstados.value = dashboard.chartPorEstado
  meses.value = dashboard.chartLabels
  chartScores.value = dashboard.chartScores
  proveedores.value = listaProveedores
})
</script>

<style scoped>
.page-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
