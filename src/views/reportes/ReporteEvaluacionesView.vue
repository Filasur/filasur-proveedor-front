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

    <div class="card toolbar-row reporte-filtros">
      <div class="field">
        <LabelHint label="Desde" hint="Fecha inicial del rango a consultar." />
        <input v-model="fechaDesde" type="date" @change="cargar" />
      </div>
      <div class="field">
        <LabelHint label="Hasta" hint="Fecha final del rango a consultar." />
        <input v-model="fechaHasta" type="date" @change="cargar" />
      </div>
      <div class="field">
        <LabelHint label="Producto / Material" />
        <select v-model="filtroProducto" @change="cargar">
          <option value="Todos">Todos</option>
          <option v-for="p in productosCatalogo" :key="p.id" :value="p.nombre">{{ p.nombre }}</option>
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
            <td>{{ r.producto || '—' }}</td>
            <td>{{ r.fechaEvaluacion || '—' }}</td>
            <td>{{ r.puntajeFinal ?? '—' }}</td>
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
import { onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import { toastError, toastSuccess } from '@/utils/alerts'
import Swal from 'sweetalert2'

const stats = ref({ total: 0, aprobados: 0, observados: 0, rechazados: 0 })
const filas = ref([])
const filtroEstado = ref('Todos')
const filtroProducto = ref('Todos')
const productosCatalogo = ref([])

function formatDateInput(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function rangoPorDefecto() {
  const hasta = new Date()
  const desde = new Date(hasta.getFullYear(), hasta.getMonth(), 1)
  return { desde: formatDateInput(desde), hasta: formatDateInput(hasta) }
}

const defecto = rangoPorDefecto()
const fechaDesde = ref(defecto.desde)
const fechaHasta = ref(defecto.hasta)

function paramsReporte() {
  const p = {
    fechaDesde: fechaDesde.value,
    fechaHasta: fechaHasta.value,
  }
  if (filtroEstado.value !== 'Todos') p.estado = filtroEstado.value
  if (filtroProducto.value !== 'Todos') p.producto = filtroProducto.value
  return p
}

async function cargar() {
  if (fechaDesde.value && fechaHasta.value && fechaDesde.value > fechaHasta.value) {
    toastError('La fecha «Desde» no puede ser mayor que «Hasta».')
    return
  }
  try {
    const data = await api.reportes.listar(paramsReporte())
    stats.value = {
      total: data.total ?? 0,
      aprobados: data.aprobados ?? 0,
      observados: data.observados ?? 0,
      rechazados: data.rechazados ?? 0,
    }
    filas.value = data.filas ?? []
  } catch (e) {
    toastError(e.message || 'No se pudo cargar el reporte.')
  }
}

function escapeHtml(value) {
  return String(value ?? '—')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function tablaHtml() {
  const filasHtml = filas.value.map((r) => `
    <tr>
      <td>${escapeHtml(r.proveedor)}</td>
      <td>${escapeHtml(r.producto)}</td>
      <td>${escapeHtml(r.fechaEvaluacion)}</td>
      <td>${escapeHtml(r.puntajeFinal)}</td>
      <td>${escapeHtml(r.estado)}</td>
    </tr>
  `).join('')

  return `
    <table>
      <thead>
        <tr>
          <th>Proveedor</th>
          <th>Producto / Material</th>
          <th>Fecha evaluación</th>
          <th>Puntaje final</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>${filasHtml}</tbody>
    </table>
  `
}

function descargarExcel() {
  const html = `
    <html><head><meta charset="UTF-8"></head><body>
      <h1>Reporte de evaluaciones</h1>
      ${tablaHtml()}
    </body></html>
  `
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-evaluaciones-${fechaDesde.value}-${fechaHasta.value}.xls`
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
        <title>Reporte de evaluaciones</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1f1f1f; }
          h1 { margin-bottom: 4px; }
          p { color: #666; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Reporte de evaluaciones</h1>
        <p>Periodo: ${escapeHtml(fechaDesde.value)} al ${escapeHtml(fechaHasta.value)}</p>
        ${tablaHtml()}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

async function exportar() {
  if (!filas.value.length) {
    toastError('No hay datos para exportar.')
    return
  }

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
  try {
    productosCatalogo.value = await api.productos.listar()
  } catch {
    productosCatalogo.value = []
  }
  await cargar()
})
</script>

<style scoped>
.reporte-filtros {
  flex-wrap: wrap;
  align-items: flex-end;
}
</style>
