<template>
  <div>
    <h2 class="page-title">Nueva evaluación</h2>
    <p class="page-subtitle">Asistente paso a paso para registrar una evaluación</p>

    <ol class="stepper card">
      <li v-for="(s, i) in steps" :key="s" :class="{ active: step === i, done: step > i }">
        <span>{{ i + 1 }}</span> {{ s }}
      </li>
    </ol>

    <section class="card step-panel">
      <div v-if="step === 0" class="form-grid two">
        <div>
          <label>Proveedor</label>
          <select v-model="form.proveedorId">
            <option value="">Seleccione</option>
            <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.razonSocial }}</option>
          </select>
        </div>
        <div>
          <label>Periodo</label>
          <input v-model="form.periodo" placeholder="Ej. 2026-Q2" />
        </div>
      </div>

      <div v-else-if="step === 1">
        <p>Seleccione los criterios a evaluar:</p>
        <div class="checks">
          <label v-for="c in criterios" :key="c.id" class="check-row">
            <input v-model="form.criterios" type="checkbox" :value="c.id" />
            {{ c.nombre }} ({{ c.peso }}%)
          </label>
        </div>
      </div>

      <div v-else-if="step === 2" class="form-grid">
        <div v-for="c in criteriosSeleccionados" :key="c.id">
          <label>{{ c.nombre }} — puntaje (0-100)</label>
          <input v-model.number="puntajes[c.id]" type="number" min="0" max="100" />
        </div>
        <div>
          <label>Observaciones</label>
          <textarea v-model="form.observaciones" rows="4"></textarea>
        </div>
      </div>

      <div v-else>
        <h3>Resumen</h3>
        <ul class="resumen">
          <li><strong>Proveedor:</strong> {{ proveedorLabel }}</li>
          <li><strong>Periodo:</strong> {{ form.periodo }}</li>
          <li><strong>Criterios:</strong> {{ form.criterios.length }}</li>
          <li><strong>Puntaje estimado:</strong> {{ puntajeEstimado }}%</li>
        </ul>
      </div>

      <div class="step-actions">
        <button v-if="step > 0" type="button" class="btn btn-ghost" @click="step--">Anterior</button>
        <button v-if="step < 3" type="button" class="btn btn-primary" :disabled="!canNext" @click="step++">
          Siguiente
        </button>
        <button v-else type="button" class="btn btn-primary" :disabled="saving" @click="guardar">
          {{ saving ? 'Guardando...' : 'Finalizar evaluación' }}
        </button>
      </div>
      <p v-if="mensaje" class="success">{{ mensaje }}</p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useEvaluacionStore } from '@/stores/evaluacion'

const steps = ['Datos generales', 'Criterios', 'Puntajes', 'Confirmación']
const step = ref(0)
const proveedores = ref([])
const criterios = ref([])
const puntajes = reactive({})
const saving = ref(false)
const mensaje = ref('')
const evalStore = useEvaluacionStore()
const router = useRouter()

const form = reactive({
  proveedorId: '',
  periodo: '',
  criterios: [],
  observaciones: '',
})

onMounted(async () => {
  ;[proveedores.value, criterios.value] = await Promise.all([
    api.proveedores.listar(),
    api.evaluaciones.listarCriterios(),
  ])
})

const criteriosSeleccionados = computed(() =>
  criterios.value.filter((c) => form.criterios.includes(c.id)),
)

const proveedorLabel = computed(
  () => proveedores.value.find((p) => p.id === form.proveedorId)?.razonSocial || '-',
)

const puntajeEstimado = computed(() => {
  const selected = criteriosSeleccionados.value
  if (!selected.length) return 0
  let total = 0
  let peso = 0
  for (const c of selected) {
    const p = Number(puntajes[c.id] || 0)
    total += p * (c.peso / 100)
    peso += c.peso
  }
  return peso ? Math.round((total / peso) * 100 * 10) / 10 : 0
})

const canNext = computed(() => {
  if (step.value === 0) return form.proveedorId && form.periodo
  if (step.value === 1) return form.criterios.length > 0
  if (step.value === 2) return criteriosSeleccionados.value.every((c) => puntajes[c.id] >= 0)
  return true
})

async function guardar() {
  saving.value = true
  mensaje.value = ''
  try {
    await evalStore.guardarBorrador({
      ...form,
      puntajes: { ...puntajes },
      puntajeEstimado: puntajeEstimado.value,
    })
    mensaje.value = 'Evaluación guardada. Puede revisar la consolidación.'
    evalStore.resetBorrador()
    router.push({ name: 'consolidacion' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.stepper {
  list-style: none;
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.stepper li {
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  background: #fafafa;
  color: var(--filasur-muted);
  font-size: 14px;
}

.stepper li span {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--filasur-border);
  margin-right: 6px;
  font-size: 12px;
}

.stepper li.active,
.stepper li.done {
  background: rgba(24, 144, 255, 0.12);
  color: var(--filasur-primary);
}

.stepper li.active span,
.stepper li.done span {
  background: var(--filasur-primary);
  color: #fff;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.checks {
  display: grid;
  gap: 8px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resumen {
  padding-left: 18px;
}

.success {
  color: var(--filasur-success);
}
</style>