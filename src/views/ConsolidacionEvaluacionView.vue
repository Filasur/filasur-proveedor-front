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
        <LabelHint
          label="ID evaluación"
          hint="Seleccione la evaluación cuyos resultados por área desea consolidar."
        />
        <select v-model="evalId" @change="cargar">
          <option v-for="e in evalIds" :key="e.id" :value="e.id">{{ e.id }} — {{ e.proveedor }}</option>
        </select>
      </div>
      <button class="btn btn-primary" type="button" :disabled="store.loading" @click="cargar">Actualizar</button>
    </div>

    <div v-if="store.loading" class="card empty-state">Cargando consolidación...</div>
    <template v-else-if="c">
      <div class="consolidacion-stack">
      <header class="card eval-header">
        <h3>Evaluación: {{ c.producto }}</h3>
        <p>Orden de compra: {{ c.ordenCompra }}</p>
        <p>Fecha de evaluación: {{ c.fechaEvaluacion }}</p>
      </header>

      <section class="card">
        <h3>Resultados por áreas</h3>
        <table class="data-table">
          <thead>
            <tr>
              <ThHint label="Área evaluadora"  />
              <ThHint label="Evaluador"  />
              <ThHint label="Puntaje (0-5)" />
              <ThHint label="Peso (%)" />
              <ThHint label="Puntaje ponderado" />
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in c.areas" :key="row.area">
              <td>{{ row.area }}</td>
              <td>{{ row.evaluador || '—' }}</td>
              <td>{{ row.puntaje }}</td>
              <td>{{ row.peso }}%</td>
              <td>{{ Number(row.ponderado ?? 0).toFixed(2) }}</td>
              <td>{{ row.observaciones || '—' }}</td>
            </tr>
            <tr v-if="!c.areas?.length">
              <td colspan="6" class="empty-state">Sin resultados por área para esta evaluación.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="result-row">
        <article class="card result-score">
          <span class="result-label">
            Puntaje final
          </span>
          <strong class="result-value">{{ c.puntajeFinal }} / {{ c.puntajeMax }}</strong>
          <div
            class="stars"
            :aria-label="`Calificación ${c.puntajeFinal ?? 0} de ${c.puntajeMax ?? 5}`"
          >
            <span
              v-for="i in totalEstrellas"
              :key="i"
              class="star"
              :class="{ filled: i <= estrellasLlenas }"
            >★</span>
          </div>
        </article>
        <article class="card result-box" :class="resultClass">
          <span>Resultado</span>
          <strong>{{ c.nivel }}</strong>
          <p>{{ textoResultado }}</p>
        </article>
        <div class="result-actions">
          <button type="button" class="btn btn-primary" @click="aprobar">Aprobar proveedor</button>
          <button type="button" class="btn btn-sesion" @click="rechazar">Rechazar</button>
          <!-- <button type="button" class="btn btn-ghost" disabled>Registrar en ERP</button> -->
        </div>
      </section>

      <section class="card">
        <p class="obs"><strong>Observaciones generales:</strong> {{ c.observaciones }}</p>
      </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEvaluacionStore } from '@/stores/evaluacion'
import api from '@/services/api'
import { confirmAction, toastError, toastSuccess } from '@/utils/alerts'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import AppTooltip from '@/components/ui/AppTooltip.vue'
import Swal from 'sweetalert2'

const route = useRoute()
const store = useEvaluacionStore()
const evalId = ref('')
const evalIds = ref([])

function parseEvaluacionId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

const c = computed(() => store.consolidacion)

const resultClass = computed(() => {
  const n = c.value?.nivel
  if (n === 'APROBADO') return 'approved'
  if (n === 'RECHAZADO') return 'rejected'
  return 'observed'
})

const textoResultado = computed(() => {
  const t = c.value?.resultado || ''
  if (t.includes('Exactus ERP')) return 'Proveedor apto'
  return t
})

const totalEstrellas = 5

const estrellasLlenas = computed(() => {
  const max = Number(c.value?.puntajeMax) || 5
  const puntaje = Number(c.value?.puntajeFinal)
  if (!Number.isFinite(puntaje) || puntaje <= 0) return 0
  return Math.min(totalEstrellas, Math.max(0, Math.round((puntaje / max) * totalEstrellas)))
})

async function cargar() {
  const id = parseEvaluacionId(evalId.value)
  if (!id) {
    toastError('Seleccione una evaluación válida.')
    return
  }
  try {
    await store.cargarConsolidacion(id)
  } catch (e) {
    toastError(e.message || 'No se pudo cargar la consolidación.')
  }
}

async function aprobar() {
  const ok = await confirmAction({
    title: '¿Aprobar proveedor?',
    text: 'El proveedor quedará apto para registro en ERP.',
    icon: 'success',
    confirmText: 'Aprobar',
  })
  if (!ok) return
  const id = parseEvaluacionId(evalId.value)
  if (!id) {
    toastError('Seleccione una evaluación válida.')
    return
  }
  try {
    await api.evaluaciones.aprobar(id)
    toastSuccess('Proveedor aprobado correctamente.')
    cargar()
  } catch (e) {
    toastError(e.message)
  }
}

async function rechazar() {
  const result = await Swal.fire({
    title: '¿Rechazar proveedor?',
    input: 'textarea',
    inputLabel: 'Motivo del rechazo',
    inputPlaceholder: 'Detalle el motivo del rechazo...',
    icon: 'error',
    showCancelButton: true,
    confirmButtonText: 'Rechazar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ff4d4f',
    inputValidator: (value) => (!value?.trim() ? 'Ingrese el motivo del rechazo.' : undefined),
  })
  if (!result.isConfirmed) return
  const id = parseEvaluacionId(evalId.value)
  if (!id) {
    toastError('Seleccione una evaluación válida.')
    return
  }
  try {
    await api.evaluaciones.rechazar(id, result.value.trim())
    toastSuccess('Proveedor rechazado.')
    cargar()
  } catch (e) {
    toastError(e.message)
  }
}

onMounted(async () => {
  try {
    evalIds.value = await api.evaluaciones.listar()
    const desdeQuery = parseEvaluacionId(route.query.id)
    if (desdeQuery) {
      evalId.value = desdeQuery
    } else if (evalIds.value.length) {
      evalId.value = evalIds.value[0].id
    }
    if (evalId.value) cargar()
  } catch (e) {
    toastError(e.message || 'No se pudo cargar el listado de evaluaciones.')
  }
})
</script>

<style scoped>
.breadcrumbs { margin-bottom: 16px; font-size: 14px; color: var(--filasur-muted); }
.breadcrumbs a { color: var(--filasur-primary); }

.consolidacion-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consolidacion-stack > .card h3,
.consolidacion-stack > section.card > h3 {
  margin: 0 0 12px;
}

.eval-header h3 { margin: 0 0 8px; }
.eval-header p { margin: 0 0 4px; color: var(--filasur-muted); font-size: 14px; }
.eval-header p:last-child { margin-bottom: 0; }

.result-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  margin: 0;
  align-items: stretch;
}
.result-score {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.result-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--filasur-muted);
}
.result-value {
  display: block;
  font-size: 28px;
  line-height: 1.2;
  margin: 4px 0 0;
}
.stars {
  display: flex;
  gap: 2px;
  margin-top: 4px;
  font-size: 18px;
  line-height: 1;
}
.star {
  color: #d9d9d9;
}
.star.filled {
  color: #faad14;
}
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
