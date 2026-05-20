<template>
  <div>
    <h2 class="page-title">Reportes</h2>
    <p class="page-subtitle">Consulta y exportación de evaluaciones y estadísticas</p>

    <div class="tabs">
      <button type="button" class="tab active">Evaluaciones</button>
      <button type="button" class="tab" disabled>Proveedores</button>
      <button type="button" class="tab" disabled>Desempeño</button>
      <button type="button" class="tab" disabled>Ranking</button>
    </div>

    <div class="kpi-row">
      <article class="card kpi-mini"><span>Aprobados</span><strong>{{ stats.aprobados }}</strong></article>
      <article class="card kpi-mini"><span>Observados</span><strong>{{ stats.observados }}</strong></article>
      <article class="card kpi-mini"><span>Rechazados</span><strong>{{ stats.rechazados }}</strong></article>
      <article class="card kpi-mini"><span>Total</span><strong>{{ stats.total }}</strong></article>
    </div>

    <div class="card toolbar-row">
      <div class="field">
        <label>Rango de fechas</label>
        <input value="01/04/2025 - 31/05/2025" readonly />
      </div>
      <div class="field">
        <label>Producto / Material</label>
        <select v-model="filtroProducto">
          <option value="Todos">Todos</option>
          <option value="Bolsa PP 50kg">Bolsa PP 50kg</option>
          <option value="Hilo Algodón 30/1">Hilo Algodón 30/1</option>
        </select>
      </div>
      <div class="field">
        <label>Estado</label>
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
            <th>Proveedor</th>
            <th>Producto / Material</th>
            <th>Fecha evaluación</th>
            <th>Puntaje final</th>
            <th>Estado</th>
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
      <div class="pagination">
        <span>Mostrando 1 a {{ filas.length }} de {{ stats.total }} resultados</span>
        <div class="pagination-btns">
          <button type="button" class="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const stats = ref({ total: 0, aprobados: 0, observados: 0, rechazados: 0 })
const filas = ref([])
const filtroEstado = ref('Todos')
const filtroProducto = ref('Todos')

async function cargar() {
  const data = await api.reportes.listar({ estado: filtroEstado.value })
  stats.value = data
  filas.value =
    filtroProducto.value === 'Todos'
      ? data.filas
      : data.filas.filter((f) => f.producto === filtroProducto.value)
}

function exportar() {
  alert('Exportación PDF/Excel disponible cuando se conecte el backend.')
}

onMounted(cargar)
</script>

<style scoped>
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.kpi-mini span { display: block; font-size: 12px; color: var(--filasur-muted); }
.kpi-mini strong { font-size: 22px; }
.tab:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
