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
import { toastError, toastSuccess } from '@/utils/alerts'
import Swal from 'sweetalert2'

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

function escapeHtml(value) {
  return String(value ?? '—')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function tablaHtml() {
  const filasHtml = filtrados.value.map((p) => `
    <tr>
      <td>${escapeHtml(p.ruc)}</td>
      <td>${escapeHtml(p.razonSocial)}</td>
      <td>${escapeHtml(p.tipoProveedor)}</td>
      <td>${escapeHtml(p.rubro)}</td>
      <td>${escapeHtml(formatPuntaje(p.puntajePromedio))}</td>
      <td>${escapeHtml(p.clasificacion)}</td>
      <td>${escapeHtml(formatEvaluaciones(p.evaluaciones))}</td>
      <td>${escapeHtml(p.estado)}</td>
    </tr>
  `).join('')

  return `
    <table>
      <thead>
        <tr>
          <th>RUC</th>
          <th>Razón social</th>
          <th>Tipo</th>
          <th>Rubro</th>
          <th>Puntaje promedio</th>
          <th>Clasificación</th>
          <th>Evaluaciones</th>
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
      <h1>Reporte de proveedores</h1>
      ${tablaHtml()}
    </body></html>
  `
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'reporte-proveedores.xls'
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
        <title>Reporte de proveedores</title>
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
        <h1>Reporte de proveedores</h1>
        <p>Total filtrado: ${filtrados.value.length}</p>
        ${tablaHtml()}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

async function seleccionarFormatoExportacion() {
  const result = await Swal.fire({
    title: 'Exportar reporte',
    html: `
      <div class="export-options">
        <button type="button" class="export-option selected" data-format="pdf">
          <strong>PDF</strong>
          <span>Vista lista para imprimir o guardar como PDF.</span>
        </button>
        <button type="button" class="export-option" data-format="excel">
          <strong>Excel</strong>
          <span>Archivo .xls con los datos filtrados.</span>
        </button>
      </div>
    `,
    icon: 'info',
    customClass: {
      popup: 'export-modal',
      htmlContainer: 'export-modal-body',
      confirmButton: 'export-confirm',
    },
    showCancelButton: true,
    confirmButtonText: 'Exportar PDF',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton()
      document.querySelectorAll('.export-option').forEach((button) => {
        button.addEventListener('click', () => {
          const selected = button.dataset.format
          document.querySelectorAll('.export-option').forEach((b) => b.classList.remove('selected'))
          button.classList.add('selected')
          if (confirmButton) {
            confirmButton.textContent = selected === 'excel' ? 'Exportar Excel' : 'Exportar PDF'
          }
        })
      })
    },
    preConfirm: () => {
      const selected = document.querySelector('.export-option.selected')?.dataset.format || 'pdf'
      return selected
    },
  })

  return result.isConfirmed ? result.value : null
}

async function exportar() {
  if (!filtrados.value.length) {
    toastError('No hay datos para exportar.')
    return
  }

  const formato = await seleccionarFormatoExportacion()
  if (!formato) return

  if (formato === 'excel') descargarExcel()
  else imprimirPdf()
  toastSuccess('Reporte generado.')
}

onMounted(async () => {
  proveedores.value = await api.proveedores.listar()
})
</script>

<style scoped>
:global(.export-modal) {
  width: min(460px, calc(100vw - 32px));
  border-radius: 14px;
  padding: 28px;
}

:global(.export-modal-body) {
  margin: 16px 0 0;
  overflow: visible;
}

:global(.export-options) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

:global(.export-option) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 104px;
  padding: 16px;
  border: 1px solid var(--filasur-border);
  border-radius: 12px;
  background: #fff;
  color: var(--filasur-text);
  text-align: left;
  cursor: pointer;
}

:global(.export-option strong) {
  font-size: 18px;
}

:global(.export-option span) {
  color: var(--filasur-muted);
  font-size: 12px;
  line-height: 1.4;
}

:global(.export-option.selected) {
  border-color: var(--filasur-primary);
  background: #e6f7ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.12);
}

:global(.export-confirm) {
  min-width: 130px;
}

@media (max-width: 520px) {
  :global(.export-options) {
    grid-template-columns: 1fr;
  }
}
</style>
