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
            <span class="kpi-label">{{ kpi.label }}</span>
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
                <th>Proveedor</th>
                <th>Producto</th>
                <th>Áreas pend.</th>
                <th>Estado</th>
                <th>Fecha límite</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in data.evaluacionesRecientes" :key="e.id">
                <td>{{ e.proveedor }}</td>
                <td>{{ e.producto }}</td>
                <td>{{ e.areasPendientes }} área</td>
                <td><StatusBadge :status="e.estado" /></td>
                <td>{{ e.fechaLimite }}</td>
                <td>
                  <RouterLink class="link-action" :to="{ name: 'consolidacion', query: { id: e.id } }">Ver</RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="card chart-card">
          <h3>Evaluaciones por estado</h3>
          <div class="donut-wrap">
            <canvas ref="chartRef" width="200" height="200"></canvas>
            <div class="donut-center">
              <strong>{{ data.chartPorEstado.total }}</strong>
              <span>Total</span>
            </div>
          </div>
          <ul class="legend">
            <li v-for="(label, i) in data.chartPorEstado.labels" :key="label">
              <span class="dot" :style="{ background: data.chartPorEstado.colors[i] }"></span>
              {{ label }} — {{ data.chartPorEstado.values[i] }}
            </li>
          </ul>
        </section>
      </div>

      <section class="card">
        <h3>Próximas evaluaciones por vencer</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Producto</th>
              <th>Áreas pendientes</th>
              <th>Fecha límite</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in data.proximasVencer" :key="e.id">
              <td>{{ e.proveedor }}</td>
              <td>{{ e.producto }}</td>
              <td>{{ e.areasPendientes }} área(s)</td>
              <td>{{ e.fechaLimite }}</td>
              <td><StatusBadge :status="e.estado" /></td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const loading = ref(true)
const data = ref(null)
const chartRef = ref(null)
let chartInstance = null

const kpis = computed(() => {
  if (!data.value) return []
  const r = data.value.resumen
  return [
    { label: 'Proveedores registrados', value: r.proveedoresRegistrados, hint: 'Total proveedores activos', icon: '👥', color: 'blue' },
    { label: 'Evaluaciones en proceso', value: r.evaluacionesEnProceso, hint: 'En evaluación actualmente', icon: '⏱', color: 'blue' },
    { label: 'Evaluaciones finalizadas', value: r.evaluacionesFinalizadas, hint: 'En los últimos 30 días', icon: '✓', color: 'green' },
    { label: 'Proveedores aprobados', value: r.proveedoresAprobados, hint: 'Listos para registrar en ERP', icon: '★', color: 'gold' },
  ]
})

function renderChart() {
  if (!chartRef.value || !data.value) return
  chartInstance?.destroy()
  const c = data.value.chartPorEstado
  chartInstance = new Chart(chartRef.value, {
    type: 'doughnut',
    data: {
      labels: c.labels,
      datasets: [{ data: c.values, backgroundColor: c.colors, borderWidth: 0 }],
    },
    options: {
      cutout: '65%',
      plugins: { legend: { display: false } },
    },
  })
}

onMounted(async () => {
  try {
    data.value = await api.dashboard.getResumen()
    renderChart()
  } finally {
    loading.value = false
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

.kpi-label { display: block; color: var(--filasur-muted); font-size: 13px; }
.kpi-value { font-size: 28px; display: block; }
.kpi small { color: var(--filasur-muted); font-size: 12px; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.dashboard-grid h3 { margin-top: 0; }

.donut-wrap {
  position: relative;
  max-width: 220px;
  margin: 0 auto 16px;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.donut-center strong { font-size: 24px; }
.donut-center span { font-size: 12px; color: var(--filasur-muted); }

.legend { list-style: none; padding: 0; margin: 0; font-size: 13px; }
.legend li { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
.dot { width: 10px; height: 10px; border-radius: 50%; }

@media (max-width: 1100px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
