<template>
  <div>
    <nav class="breadcrumbs">
      <RouterLink :to="{ name: 'evaluaciones-pendientes' }">Evaluaciones</RouterLink>
      <span>/</span>
      <span>Consolidación</span>
    </nav>

    <h2 class="page-title">Consolidación de evaluación</h2>
    <p class="page-subtitle">Promedio automático, resultado final y decisión por área</p>

    <div class="card toolbar-row">
      <div class="field">
        <label>ID evaluación</label>
        <select v-model="evalId" @change="cargar">
          <option v-for="e in evalIds" :key="e.id" :value="e.id">{{ e.id }} — {{ e.proveedor }}</option>
        </select>
      </div>
      <button class="btn btn-primary" type="button" :disabled="store.loading" @click="cargar">Actualizar</button>
    </div>

    <div v-if="store.loading" class="card empty-state">Cargando consolidación...</div>
    <template v-else-if="c">
      <header class="card eval-header">
        <h3>Evaluación: {{ c.producto }}</h3>
        <p>Orden de compra: {{ c.ordenCompra }} · Fecha de evaluación: {{ c.fechaEvaluacion }}</p>
      </header>

      <section class="card">
        <h3>Resultados por áreas</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Área evaluadora</th>
              <th>Evaluador</th>
              <th>Puntaje (0-5)</th>
              <th>Peso (%)</th>
              <th>Puntaje ponderado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in c.areas" :key="row.area">
              <td>{{ row.area }}</td>
              <td>{{ row.evaluador }}</td>
              <td>{{ row.puntaje }}</td>
              <td>{{ row.peso }}%</td>
              <td>{{ row.ponderado.toFixed(2) }}</td>
              <td>{{ row.observaciones }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="result-row">
        <article class="card result-score">
          <span>Puntaje final</span>
          <strong>{{ c.puntajeFinal }} / {{ c.puntajeMax }}</strong>
          <div class="stars">★★★★☆</div>
        </article>
        <article class="card result-box" :class="resultClass">
          <span>Resultado</span>
          <strong>{{ c.nivel }}</strong>
          <p>{{ c.resultado }}</p>
        </article>
        <div class="result-actions">
          <button type="button" class="btn btn-primary" @click="aprobar">Aprobar proveedor</button>
          <button type="button" class="btn btn-ghost" @click="rechazar">Rechazar</button>
          <button type="button" class="btn btn-ghost" disabled>Registrar en ERP</button>
        </div>
      </section>

      <section class="card">
        <p class="obs"><strong>Observaciones generales:</strong> {{ c.observaciones }}</p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEvaluacionStore } from '@/stores/evaluacion'
import api from '@/services/api'

const route = useRoute()
const store = useEvaluacionStore()
const evalId = ref(route.query.id || 'ev-001')
const evalIds = ref([])

const c = computed(() => store.consolidacion)

const resultClass = computed(() => {
  const n = c.value?.nivel
  if (n === 'APROBADO') return 'approved'
  if (n === 'RECHAZADO') return 'rejected'
  return 'observed'
})

function cargar() {
  store.cargarConsolidacion(evalId.value)
}

async function aprobar() {
  await api.evaluaciones.aprobar(evalId.value)
  alert('Proveedor aprobado (mock).')
}

async function rechazar() {
  await api.evaluaciones.rechazar(evalId.value)
  alert('Proveedor rechazado (mock).')
}

onMounted(async () => {
  evalIds.value = await api.evaluaciones.listar()
  cargar()
})
</script>

<style scoped>
.breadcrumbs { margin-bottom: 16px; font-size: 14px; color: var(--filasur-muted); }
.breadcrumbs a { color: var(--filasur-primary); }
.eval-header h3 { margin: 0 0 8px; }
.eval-header p { margin: 0; color: var(--filasur-muted); font-size: 14px; }
.result-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  margin: 16px 0;
  align-items: stretch;
}
.result-score span, .result-box span { display: block; font-size: 13px; color: var(--filasur-muted); }
.result-score strong { font-size: 28px; }
.stars { color: #faad14; margin-top: 8px; }
.result-box strong { font-size: 22px; display: block; margin: 8px 0; }
.result-box.approved { border-color: var(--filasur-success); background: #f6ffed; }
.result-box.approved strong { color: var(--filasur-success); }
.result-box.rejected { border-color: var(--filasur-danger); background: #fff2f0; }
.result-box.rejected strong { color: var(--filasur-danger); }
.result-box.observed { border-color: var(--filasur-warning); background: #fffbe6; }
.result-actions { display: flex; flex-direction: column; gap: 8px; justify-content: center; }
.obs { margin: 0; color: var(--filasur-muted); }
@media (max-width: 900px) {
  .result-row { grid-template-columns: 1fr; }
}
</style>
