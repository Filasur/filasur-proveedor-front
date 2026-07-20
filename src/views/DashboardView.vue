<template>
  <div>
    <h2 class="page-title">Dashboard</h2>
    <p class="page-subtitle">Resumen general del sistema de evaluación de proveedores</p>

    <div v-if="loading" class="card empty-state">Cargando indicadores...</div>
    <template v-else-if="data">
      <section class="kpi-grid">
        <article v-for="kpi in kpis" :key="kpi.label" class="card kpi">
          <span class="kpi-icon" :class="kpi.color">{{ kpi.icon }}</span>
          <div>
            <span class="kpi-label">
              {{ kpi.label }}
              <AppTooltip v-if="kpi.tooltip" :text="kpi.tooltip" />
            </span>
            <strong class="kpi-value">{{ kpi.value }}</strong>
            <small>{{ kpi.hint }}</small>
          </div>
        </article>
      </section>

      <div class="dashboard-grid">
        <section class="card">
          <h3>Evaluaciones recientes</h3>
          <table class="data-table">
            <thead>
              <tr>
                <ThHint label="Proveedor" hint="Empresa en proceso de evaluación." />
                <ThHint label="Producto" hint="Material o ítem evaluado." />
                <ThHint label="Áreas pend." hint="Áreas que aún no han calificado." />
                <ThHint label="Estado" hint="Estado actual del flujo." />
                <ThHint label="Fecha límite" hint="Fecha máxima para completar la evaluación." />
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in data.evaluacionesRecientes" :key="e.id">
                <td>{{ e.proveedor }}</td>
                <td>{{ e.producto || '—' }}</td>
                <td>{{ e.areasPendientes ? `${e.areasPendientes} área` : 'Completa' }}</td>
                <td><StatusBadge :status="e.estado" /></td>
                <td>{{ e.fechaLimite || '—' }}</td>
                <td>
                  <RouterLink class="link-action" :to="{ name: 'consolidacion', query: { id: e.id } }">Ver</RouterLink>
                </td>
              </tr>
              <tr v-if="!data.evaluacionesRecientes?.length">
                <td colspan="6" class="empty-state">No hay evaluaciones registradas.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="card chart-card">
          <h3 class="chart-card-title">Evaluaciones por estado</h3>
          <div class="chart-card-body">
            <div class="donut-wrap" aria-hidden="true">
              <canvas ref="chartRef"></canvas>
              <div class="donut-center">
                <strong>{{ data.chartPorEstado.total }}</strong>
                <span>Total</span>
              </div>
            </div>
            <ul class="legend">
              <li v-for="(label, i) in data.chartPorEstado.labels" :key="label">
                <span class="dot" :style="{ background: data.chartPorEstado.colors[i] }"></span>
                <span class="legend-text">
                  <span class="legend-label">{{ label }}</span>
                  <span class="legend-value">{{ data.chartPorEstado.values[i] }}</span>
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <section class="card">
        <h3>Próximas evaluaciones por vencer</h3>
        <table class="data-table">
          <thead>
            <tr>
              <ThHint label="Proveedor" hint="Empresa con evaluación próxima a vencer." />
              <ThHint label="Producto" hint="Material evaluado." />
              <ThHint label="Áreas pendientes" hint="Áreas sin puntaje registrado." />
              <ThHint label="Fecha límite" hint="Vencimiento del plazo de evaluación." />
              <ThHint label="Estado" hint="En proceso, pendiente, etc." />
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in data.proximasVencer" :key="e.id">
              <td>{{ e.proveedor }}</td>
              <td>{{ e.producto || '—' }}</td>
              <td>{{ e.areasPendientes ? `${e.areasPendientes} área(s)` : 'Completa' }}</td>
              <td>{{ e.fechaLimite || '—' }}</td>
              <td><StatusBadge :status="e.estado" /></td>
            </tr>
            <tr v-if="!data.proximasVencer?.length">
              <td colspan="5" class="empty-state">No hay evaluaciones próximas a vencer.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card">
        <h3>
          Documentos por vencer
          <span v-if="data.resumen?.documentosPorVencer" class="badge-alerta">
            {{ data.resumen.documentosPorVencer }}
          </span>
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <ThHint label="Proveedor" hint="Empresa dueña del documento." />
              <ThHint label="Archivo" hint="Nombre del documento cargado." />
              <ThHint label="Categoría" hint="Tipo documental." />
              <ThHint label="Vencimiento" hint="Fecha de caducidad del documento." />
              <ThHint label="Estado" hint="Vencido o próximo a vencer." />
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in data.documentosPorVencer" :key="d.id">
              <td>{{ d.proveedor }}</td>
              <td>{{ d.archivo }}</td>
              <td>{{ d.categoria }}</td>
              <td>{{ d.fechaVencimiento || '—' }}</td>
              <td><StatusBadge :status="d.estado" /></td>
            </tr>
            <tr v-if="!data.documentosPorVencer?.length">
              <td colspan="5" class="empty-state">No hay documentos próximos a vencer.</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AppTooltip from '@/components/ui/AppTooltip.vue'
import ThHint from '@/components/ui/ThHint.vue'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const loading = ref(true)
const data = ref(null)
const chartRef = ref(null)
let chartInstance = null

const kpis = computed(() => {
  if (!data.value?.resumen) return []
  const r = data.value.resumen
  return [
    {
      label: 'Proveedores registrados',
      value: r.proveedoresRegistrados ?? 0,
      hint: 'Total proveedores activos',
      tooltip: 'Cantidad de proveedores dados de alta en el sistema.',
      icon: '👥',
      color: 'blue',
    },
    {
      label: 'Evaluaciones en proceso',
      value: r.evaluacionesEnProceso ?? 0,
      hint: 'En evaluación actualmente',
      tooltip: 'Evaluaciones que aún no han sido consolidadas o cerradas.',
      icon: '⏱',
      color: 'blue',
    },
    {
      label: 'Evaluaciones finalizadas',
      value: r.evaluacionesFinalizadas ?? 0,
      hint: 'En los últimos 30 días',
      tooltip: 'Evaluaciones completadas en el último mes.',
      icon: '✓',
      color: 'green',
    },
    {
      label: 'Proveedores aprobados',
      value: r.proveedoresAprobados ?? 0,
      hint: 'Con resultado aprobado',
      tooltip: 'Proveedores con estado APROBADO en el sistema.',
      icon: '★',
      color: 'gold',
    },
  ]
})

function renderChart() {
  if (!chartRef.value || !data.value?.chartPorEstado) return
  chartInstance?.destroy()
  const c = data.value.chartPorEstado
  chartInstance = new Chart(chartRef.value, {
    type: 'doughnut',
    data: {
      labels: c.labels,
      datasets: [
        {
          data: c.values,
          backgroundColor: c.colors,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
              const pct = total ? Math.round((ctx.raw / total) * 100) : 0
              return ` ${ctx.label}: ${ctx.raw} (${pct}%)`
            },
          },
        },
      },
    },
  })
}

onMounted(async () => {
  try {
    data.value = await api.dashboard.getResumen()
  } finally {
    loading.value = false
    await nextTick()
    renderChart()
  }
})

onBeforeUnmount(() => chartInstance?.destroy())
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.kpi {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 20px;
}

.kpi-icon.blue { background: #e6f7ff; }
.kpi-icon.green { background: #f6ffed; }
.kpi-icon.gold { background: #fffbe6; }

.kpi-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--filasur-muted);
  font-size: 13px;
}
.kpi-value { font-size: 28px; display: block; }
.kpi small { color: var(--filasur-muted); font-size: 12px; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.dashboard-grid h3 { margin-top: 0; }

.chart-card {
  display: flex;
  flex-direction: column;
}

.chart-card-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.chart-card-body {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 28px 36px;
  padding: 12px 8px 4px;
  min-height: 240px;
}

.donut-wrap {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.donut-wrap canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
}

.donut-center strong {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.1;
  color: var(--filasur-text);
}

.donut-center span {
  font-size: 12px;
  color: var(--filasur-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.legend {
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
}

.legend-text {
  display: flex;
  flex: 1;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.legend-label {
  color: var(--filasur-text);
}

.legend-value {
  font-weight: 600;
  color: var(--filasur-muted);
  font-variant-numeric: tabular-nums;
}

.badge-alerta {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #ad4e00;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 10px;
  vertical-align: middle;
}

@media (max-width: 1100px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
