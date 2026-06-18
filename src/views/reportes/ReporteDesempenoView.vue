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
import { toastError, toastSuccess } from '@/utils/alerts'
import Swal from 'sweetalert2'

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

function escapeHtml(value) {
  return String(value ?? '—')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function resumenHtml() {
  const distribucionRows = distribucionClase.value.map((row) => `
    <tr>
      <td>${escapeHtml(row.clase)}</td>
      <td>${escapeHtml(row.cantidad)}</td>
      <td>${escapeHtml(row.porcentaje)}%</td>
    </tr>
  `).join('')

  const estadoRows = chartEstados.value.labels.map((label, i) => `
    <tr>
      <td>${escapeHtml(label)}</td>
      <td>${escapeHtml(chartEstados.value.values[i])}</td>
    </tr>
  `).join('')

  const evolucionRows = meses.value.map((mes, i) => `
    <tr>
      <td>${escapeHtml(mes)}</td>
      <td>${escapeHtml(chartScores.value[i])}%</td>
    </tr>
  `).join('')

  return `
    <h2>Indicadores</h2>
    <table>
      <tbody>
        <tr><th>Puntaje promedio global</th><td>${escapeHtml(puntajePromedioPct.value)}</td></tr>
        <tr><th>Evaluaciones finalizadas</th><td>${escapeHtml(resumen.value?.evaluacionesFinalizadas ?? 0)}</td></tr>
        <tr><th>En proceso</th><td>${escapeHtml(resumen.value?.evaluacionesEnProceso ?? 0)}</td></tr>
        <tr><th>Proveedores activos</th><td>${escapeHtml(resumen.value?.proveedoresActivos ?? 0)}</td></tr>
      </tbody>
    </table>

    <h2>Distribución por clasificación</h2>
    <table>
      <thead><tr><th>Clasificación</th><th>Cantidad</th><th>%</th></tr></thead>
      <tbody>${distribucionRows}</tbody>
    </table>

    <h2>Evolución mensual</h2>
    <table>
      <thead><tr><th>Mes</th><th>Puntaje %</th></tr></thead>
      <tbody>${evolucionRows}</tbody>
    </table>

    <h2>Evaluaciones por estado</h2>
    <table>
      <thead><tr><th>Estado</th><th>Cantidad</th></tr></thead>
      <tbody>${estadoRows}</tbody>
    </table>
  `
}

function descargarExcel() {
  const html = `
    <html><head><meta charset="UTF-8"></head><body>
      <h1>Reporte de desempeño</h1>
      ${resumenHtml()}
    </body></html>
  `
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'reporte-desempeno.xls'
  a.click()
  URL.revokeObjectURL(url)
}

function imprimirPdf() {
  const win = window.open('', '_blank')
  if (!win) {
    toastError('El navegador bloqueó la ventana de impresión.')
    return
  }
  win.document.write(`
    <html>
      <head>
        <title>Reporte de desempeño</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1f1f1f; }
          h1 { margin-bottom: 12px; }
          h2 { margin-top: 22px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Reporte de desempeño</h1>
        ${resumenHtml()}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

async function exportar() {
  const result = await Swal.fire({
    title: 'Exportar reporte',
    input: 'select',
    inputOptions: { pdf: 'PDF', excel: 'Excel' },
    inputValue: 'pdf',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Exportar',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return

  if (result.value === 'excel') descargarExcel()
  else imprimirPdf()
  toastSuccess('Reporte generado.')
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
