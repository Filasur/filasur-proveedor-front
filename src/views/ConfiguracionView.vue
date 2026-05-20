<template>
  <div>
    <h2 class="page-title">Configuración</h2>
    <p class="page-subtitle">Parámetros generales y pesos de criterios de evaluación</p>

    <form v-if="config" class="card form-grid two" @submit.prevent="guardarConfig">
      <h3 class="section-title full">Parámetros generales</h3>
      <div>
        <LabelHint
          label="Umbral aprobación (puntaje 0-5)"
          hint="Puntaje mínimo en escala 0-5 para marcar un proveedor como APROBADO."
        />
        <input v-model.number="config.umbralAprobacion" type="number" step="0.1" min="0" max="5" />
      </div>
      <div>
        <LabelHint
          label="Umbral observado (puntaje 0-5)"
          hint="Puntaje mínimo para estado OBSERVADO (entre este valor y aprobación)."
        />
        <input v-model.number="config.umbralObservado" type="number" step="0.1" min="0" max="5" />
      </div>
      <div>
        <LabelHint
          label="Días alerta antes de vencimiento"
          hint="Cuántos días antes del vencimiento se muestra alerta en el dashboard."
        />
        <input v-model.number="config.diasAlertaVencimiento" type="number" min="1" />
      </div>
      <div>
        <LabelHint
          label="Integración ERP"
          hint="Sistema externo donde se registrarán proveedores aprobados (ej. Exactus)."
        />
        <input v-model="config.integracionErp" />
      </div>
      <div class="full checkbox-row">
        <label>
          <input v-model="config.notificacionesEmail" type="checkbox" />
          Enviar notificaciones por correo
          <AppTooltip text="Envía avisos por correo cuando haya evaluaciones por vencer o resultados." />
        </label>
      </div>
      <div class="actions full">
        <button class="btn btn-primary" type="submit" :disabled="loadingConfig">
          {{ loadingConfig ? 'Guardando...' : 'Guardar parámetros' }}
        </button>
      </div>
    </form>

    <section v-if="criterios.length" class="card criterios-section">
      <h3 class="section-title">Criterios y pesos (%)</h3>
      <p class="section-hint">
        Ajuste el peso de cada criterio. Los criterios <strong>activos</strong> deben sumar exactamente 100%.
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Criterio" />
            <ThHint label="Área" />
            <ThHint label="Peso (%)" />
            <ThHint label="Activo" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in criterios" :key="c.id">
            <td>{{ c.nombre }}</td>
            <td>{{ c.area }}</td>
            <td>
              <input
                v-model.number="c.peso"
                type="number"
                min="0"
                max="100"
                step="1"
                class="input-peso"
                :disabled="!c.activo"
              />
            </td>
            <td>
              <label class="activo-check">
                <input v-model="c.activo" type="checkbox" />
                Activo
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      <p class="suma-pesos" :class="{ 'suma-pesos--error': !sumaValida }">
        Suma de criterios activos: <strong>{{ sumaActivos }}%</strong>
        <span v-if="!sumaValida"> — debe ser 100% para guardar</span>
      </p>

      <div class="actions">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loadingCriterios || !sumaValida"
          @click="guardarCriterios"
        >
          {{ loadingCriterios ? 'Guardando...' : 'Guardar criterios' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import { toastError, toastSuccess } from '@/utils/alerts'
import LabelHint from '@/components/ui/LabelHint.vue'
import AppTooltip from '@/components/ui/AppTooltip.vue'
import ThHint from '@/components/ui/ThHint.vue'

const config = ref(null)
const criterios = ref([])
const loadingConfig = ref(false)
const loadingCriterios = ref(false)

const sumaActivos = computed(() =>
  criterios.value.filter((c) => c.activo).reduce((acc, c) => acc + (Number(c.peso) || 0), 0)
)

const sumaValida = computed(() => {
  const activos = criterios.value.filter((c) => c.activo)
  if (!activos.length) return false
  return sumaActivos.value === 100
})

onMounted(async () => {
  const [cfg, lista] = await Promise.all([api.configuracion.obtener(), api.criterios.listar()])
  config.value = cfg
  criterios.value = lista.map((c) => ({ ...c }))
})

async function guardarConfig() {
  loadingConfig.value = true
  try {
    config.value = await api.configuracion.guardar({ ...config.value })
    toastSuccess('Parámetros guardados correctamente.')
  } catch (e) {
    toastError(e.message)
  } finally {
    loadingConfig.value = false
  }
}

async function guardarCriterios() {
  if (!sumaValida.value) {
    toastError('La suma de pesos de criterios activos debe ser 100%.')
    return
  }
  loadingCriterios.value = true
  try {
    criterios.value = await api.criterios.guardar(
      criterios.value.map((c) => ({
        ...c,
        peso: Math.max(0, Math.min(100, Number(c.peso) || 0)),
      }))
    )
    toastSuccess('Criterios y pesos guardados correctamente.')
  } catch (e) {
    toastError(e.message)
  } finally {
    loadingCriterios.value = false
  }
}
</script>

<style scoped>
.full {
  grid-column: 1 / -1;
}
.section-title {
  margin: 0 0 4px;
  font-size: 16px;
}
.section-hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--filasur-muted);
}
.checkbox-row label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.criterios-section {
  margin-top: 16px;
}
.input-peso {
  width: 80px;
}
.activo-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
.suma-pesos {
  margin: 16px 0 0;
  font-size: 14px;
  color: var(--filasur-muted);
}
.suma-pesos--error {
  color: var(--filasur-danger);
}
.suma-pesos strong {
  color: var(--filasur-text);
}
.suma-pesos--error strong {
  color: var(--filasur-danger);
}
</style>
