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
          <LabelHint label="Proveedor" hint="Empresa que será evaluada en este proceso." />
          <select v-model="form.proveedorId">
            <option value="">Seleccione</option>
            <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.razonSocial }}</option>
          </select>
        </div>
        <div>
          <LabelHint
            label="Periodo"
            hint="Ciclo de evaluación (trimestre o código interno), ej. 2026-Q2."
          />
          <input v-model="form.periodo" placeholder="Ej. 2026-Q2" />
        </div>
        <div>
          <LabelHint
            label="Producto / Material"
            hint="Material o insumo evaluado (catálogo de productos)."
          />
          <select v-model="form.idProducto">
            <option value="">Sin especificar</option>
            <option v-for="p in productos" :key="p.id" :value="p.id">
              {{ p.nombre }} ({{ p.codigo }})
            </option>
          </select>
        </div>
        <div>
          <LabelHint
            label="Orden de compra"
            hint="Código de la OC asociada a esta evaluación (opcional)."
          />
          <input v-model="form.ordenCompra" placeholder="Ej. OC-2026-01562" />
        </div>
      </div>

      <div v-else-if="step === 1">
        <ol class="fases-stepper">
          <li
            v-for="(fase, i) in ORDEN_FASES"
            :key="fase"
            :class="{
              active: indiceFase === i,
              done: indiceFase > i,
              mine: fase === auth.user?.rol,
            }"
          >
            <span>{{ i + 1 }}</span> {{ fase }}
          </li>
        </ol>
        <p class="step-hint">
          <template v-if="esAdmin">
            Como administrador puede completar todos los puntajes (sin respetar el orden por roles).
          </template>
          <template v-else-if="esMiTurno">
            Es su turno (<strong>{{ auth.user?.rol }}</strong>). Complete solo sus criterios y guarde el
            borrador; luego continúa el siguiente rol
            (orden: Calidad → Compras → Logística).
          </template>
          <template v-else>
            {{ avisoTurno || 'Aún no es su turno de evaluar.' }}
          </template>
        </p>
        <div v-if="mapeoVisible.length" class="mapeo-roles card-inline">
          <span v-for="m in mapeoVisible" :key="m.area" class="mapeo-chip">
            {{ m.area }} → {{ m.rol }}
          </span>
        </div>
        <p v-if="!criteriosACalificar.length" class="empty-state">
          No hay criterios activos asignados a su rol.
        </p>
        <div v-else-if="!esMiTurno && !esAdmin" class="aviso-turno card-inline">
          {{ avisoTurno }}
          <RouterLink :to="{ name: 'evaluaciones-pendientes' }" class="link-pendientes">
            Ir a evaluaciones pendientes
          </RouterLink>
        </div>
        <div v-else class="form-grid puntajes-grid">
          <div v-for="c in criteriosACalificar" :key="c.id" class="puntaje-row">
            <div class="puntaje-row-head">
              <span class="area-badge">{{ c.area }}</span>
              <span class="peso">
                Peso {{ c.peso }}%
                <AppTooltip text="Porcentaje de influencia de este criterio en el puntaje final." />
              </span>
            </div>
            <label :for="`puntaje-${c.id}`" class="criterio-nombre">
              {{ c.nombre }}
              <span class="area-hint">{{ etiquetaCalificador(c.area) }}</span>
            </label>
            <input
              :id="`puntaje-${c.id}`"
              :value="puntajes[c.id] ?? ''"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="0–100"
              :class="{ 'input-invalid': erroresPuntaje[c.id] }"
              @input="onPuntajeInput(c.id, $event)"
              @blur="onPuntajeBlur(c.id, $event)"
            />
            <p v-if="erroresPuntaje[c.id]" class="field-error">{{ erroresPuntaje[c.id] }}</p>
          </div>
          <div class="full">
            <LabelHint
              label="Observaciones generales"
              hint="Comentarios adicionales sobre la evaluación (opcional)."
            />
            <textarea v-model="form.observaciones" rows="4"></textarea>
          </div>
        </div>
      </div>

      <div v-else>
        <h3>Resumen</h3>
        <ul class="resumen">
          <li><strong>Proveedor:</strong> {{ proveedorLabel }}</li>
          <li><strong>Periodo:</strong> {{ form.periodo }}</li>
          <li><strong>Producto:</strong> {{ productoLabel }}</li>
          <li><strong>Orden de compra:</strong> {{ form.ordenCompra || '—' }}</li>
          <li><strong>Criterios de su rol:</strong> {{ criteriosACalificar.length }}</li>
          <li v-if="esAdmin"><strong>Puntaje estimado:</strong> {{ puntajeEstimado }}%</li>
          <li v-else>
            <strong>Estado:</strong>
            {{
              todosLosPuntajesCompletos
                ? 'Todas las fases completas — puede finalizar'
                : `Fase ${auth.user?.rol} lista — el siguiente rol continuará`
            }}
          </li>
        </ul>
        <table class="data-table resumen-tabla">
          <thead>
            <tr>
              <ThHint label="Criterio" />
              <ThHint label="Rol evaluador"/>
              <ThHint label="Peso"/>
              <ThHint label="Puntaje"/>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in criteriosACalificar" :key="c.id">
              <td>{{ c.nombre }}</td>
              <td>{{ etiquetaCalificador(c.area) }}</td>
              <td>{{ c.peso }}%</td>
              <td>{{ puntajes[c.id] ?? '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="step-actions">
        <p v-if="avisoSiguiente" class="step-actions-aviso" role="status">
          {{ avisoSiguiente }}
        </p>
        <div class="step-actions-btns">
          <button v-if="step > 0" type="button" class="btn btn-ghost" @click="step--">Anterior</button>
          <button
            v-if="step < 2"
            type="button"
            class="btn btn-primary"
            :disabled="!canNext"
            :title="avisoSiguiente || undefined"
            @click="onSiguiente"
          >
            Siguiente
          </button>
          <button v-else type="button" class="btn btn-primary" :disabled="saving || !puedeGuardar" @click="guardar">
            {{ textoBotonGuardar }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import api from '@/services/api'
import { useEvaluacionStore } from '@/stores/evaluacion'
import { useAuthStore } from '@/stores/auth'
import { toastError, toastSuccess } from '@/utils/alerts'
import { ROLES } from '@/security/permissions'
import {
  etiquetaCalificador,
  puedeCalificarArea,
  puedeIniciarEvaluacion,
  esTurnoDelRol,
  faseActual,
  indiceFaseActual,
  mensajeEsperaTurno,
  ORDEN_FASES,
  RESUMEN_MAPEO_AREAS,
} from '@/utils/areaEvaluacion'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import AppTooltip from '@/components/ui/AppTooltip.vue'

const steps = ['Datos generales', 'Puntajes', 'Confirmación']
const step = ref(0)
const proveedores = ref([])
const productos = ref([])
const criterios = ref([])
const puntajes = reactive({})
const erroresPuntaje = reactive({})
const saving = ref(false)

const PUNTAJE_MIN = 0
const PUNTAJE_MAX = 100
const evalStore = useEvaluacionStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  id: null,
  proveedorId: '',
  periodo: '',
  idProducto: '',
  ordenCompra: '',
  criterios: [],
  observaciones: '',
})

/** Criterios activos: se usan todos por defecto (sin paso de selección). */
const criteriosActivos = computed(() =>
  criterios.value.filter((c) => c.activo !== false),
)

const criteriosACalificar = computed(() =>
  criteriosActivos.value.filter((c) => puedeCalificar(c.area)),
)

const esAdmin = computed(() => auth.user?.rol === ROLES.admin)

const indiceFase = computed(() => indiceFaseActual(criteriosActivos.value, puntajes))

const esMiTurno = computed(() => esTurnoDelRol(auth.user?.rol, criteriosActivos.value, puntajes))

const avisoTurno = computed(() =>
  mensajeEsperaTurno(auth.user?.rol, criteriosActivos.value, puntajes),
)

const puedeGuardar = computed(() => esAdmin.value || esMiTurno.value)

const mapeoVisible = computed(() => {
  if (esAdmin.value) return RESUMEN_MAPEO_AREAS
  return RESUMEN_MAPEO_AREAS.filter((m) => m.rol === auth.user?.rol)
})

const todosLosPuntajesCompletos = computed(() =>
  criteriosActivos.value.every((c) => puntajeValido(puntajes[c.id])),
)

function puedeCalificar(area) {
  return puedeCalificarArea(auth.user?.rol, area)
}

const proveedorLabel = computed(
  () => proveedores.value.find((p) => p.id === Number(form.proveedorId))?.razonSocial || '-',
)

const productoLabel = computed(() => {
  const p = productos.value.find((x) => x.id === Number(form.idProducto))
  return p ? `${p.nombre} (${p.codigo})` : '—'
})

const puntajeEstimado = computed(() => {
  const lista = criteriosActivos.value
  if (!lista.length) return 0
  let total = 0
  let peso = 0
  for (const c of lista) {
    const p = Number(puntajes[c.id] || 0)
    total += p * (c.peso / 100)
    peso += c.peso
  }
  return peso ? Math.round((total / peso) * 100 * 10) / 10 : 0
})

const canNext = computed(() => {
  if (step.value === 0) return Boolean(form.proveedorId && form.periodo?.trim())
  if (step.value === 1) {
    if (!puedeGuardar.value) return false
    return criteriosACalificar.value.every((c) => puntajeValido(puntajes[c.id]) && !erroresPuntaje[c.id])
  }
  return true
})

/** Mensaje cuando Siguiente está deshabilitado */
const avisoSiguiente = computed(() => {
  if (canNext.value || step.value >= 2) return ''

  if (step.value === 0) {
    const faltaProveedor = !form.proveedorId
    const faltaPeriodo = !form.periodo?.trim()
    if (faltaProveedor && faltaPeriodo) {
      return 'Complete el proveedor y el periodo para continuar.'
    }
    if (faltaProveedor) return 'Seleccione un proveedor para continuar.'
    return 'Ingrese el periodo de evaluación para continuar.'
  }

  if (step.value === 1) {
    if (!puedeGuardar.value) {
      return avisoTurno.value || 'Aún no es su turno de evaluar.'
    }
    const faltan = criteriosACalificar.value.filter((c) => !puntajeValido(puntajes[c.id]))
    if (!faltan.length) {
      return 'Corrija los puntajes marcados en rojo antes de continuar.'
    }
    if (faltan.length === 1) {
      return `Falta ingresar el puntaje de «${faltan[0].nombre}» (0–100).`
    }
    return `Faltan ${faltan.length} criterios por completar. Ingrese un puntaje entre 0 y 100 en cada campo.`
  }

  return ''
})

function puntajeValido(v) {
  return typeof v === 'number' && !Number.isNaN(v) && v >= PUNTAJE_MIN && v <= PUNTAJE_MAX
}

function normalizarPuntaje(raw) {
  if (raw === '' || raw === null || raw === undefined) return { valor: null, error: null }
  const n = Number(raw)
  if (Number.isNaN(n)) return { valor: null, error: 'Ingrese un número válido.' }
  if (n < PUNTAJE_MIN) return { valor: PUNTAJE_MIN, error: `El mínimo permitido es ${PUNTAJE_MIN}.` }
  if (n > PUNTAJE_MAX) return { valor: PUNTAJE_MAX, error: `El máximo permitido es ${PUNTAJE_MAX}.` }
  return { valor: Math.round(n), error: null }
}

function onPuntajeInput(id, event) {
  const { valor, error } = normalizarPuntaje(event.target.value)
  puntajes[id] = valor
  if (error) erroresPuntaje[id] = error
  else delete erroresPuntaje[id]
  if (valor !== null) event.target.value = valor
}

function onPuntajeBlur(id, event) {
  onPuntajeInput(id, event)
}

function sincronizarCriterios() {
  const activos = criteriosActivos.value
  form.criterios = activos.map((c) => c.id)
  activos.forEach((c) => {
    if (puntajes[c.id] === undefined) puntajes[c.id] = null
  })
}

function aplicarBorrador(data) {
  form.id = data.id
  form.proveedorId = data.proveedorId
  form.periodo = data.periodo || ''
  form.idProducto = data.idProducto || ''
  form.ordenCompra = data.ordenCompra || ''
  form.observaciones = data.observaciones || ''

  Object.keys(puntajes).forEach((key) => delete puntajes[key])
  Object.entries(data.puntajes || {}).forEach(([key, value]) => {
    puntajes[key] = Number(value)
  })
  sincronizarCriterios()
}

function onSiguiente() {
  if (step.value === 0) sincronizarCriterios()
  step.value++
}

const textoBotonGuardar = computed(() => {
  if (saving.value) return 'Guardando...'
  return todosLosPuntajesCompletos.value ? 'Finalizar evaluación' : 'Guardar y pasar al siguiente rol'
})

onMounted(async () => {
  const idBorrador = Number(route.query.id)
  const esContinuacion = Number.isInteger(idBorrador) && idBorrador > 0

  if (!esContinuacion && !puedeIniciarEvaluacion(auth.user?.rol)) {
    toastError(
      'Solo Calidad inicia una evaluación nueva. Use Evaluaciones pendientes cuando sea su turno (después de Calidad → Compras → Logística).',
    )
    router.replace({ name: 'evaluaciones-pendientes' })
    return
  }

  try {
    ;[proveedores.value, productos.value, criterios.value] = await Promise.all([
      api.proveedores.listar(),
      api.productos.listar(),
      api.evaluaciones.listarCriterios(),
    ])
    sincronizarCriterios()
    if (esContinuacion) {
      try {
        const borrador = await api.evaluaciones.obtenerBorrador(idBorrador)
        aplicarBorrador(borrador)
        const turno = faseActual(criteriosActivos.value, puntajes)
        if (!esAdmin.value && !esMiTurno.value) {
          toastError(
            turno
              ? `Aún no es su turno. Falta completar la fase de «${turno}».`
              : 'Esta evaluación ya tiene todos los puntajes.',
          )
        } else {
          toastSuccess('Borrador cargado para continuar la evaluación.')
        }
      } catch (e) {
        toastError(
          e.message === 'Borrador no encontrado'
            ? 'Esta evaluación ya no se puede editar (está aprobada, rechazada o finalizada). Se abrirá la consolidación.'
            : e.message || 'No se pudo cargar el borrador.',
        )
        router.replace({ name: 'consolidacion', query: { id: idBorrador } })
        return
      }
    }
  } catch (e) {
    toastError(e.message || 'No se pudieron cargar proveedores o criterios.')
  }
})

async function guardar() {
  if (!puedeGuardar.value) {
    toastError(avisoTurno.value || 'Aún no es su turno.')
    return
  }
  sincronizarCriterios()
  saving.value = true
  const finalizar = todosLosPuntajesCompletos.value
  try {
    const puntajesPermitidos = Object.fromEntries(
      criteriosACalificar.value
        .filter((c) => puntajeValido(puntajes[c.id]))
        .map((c) => [String(c.id), puntajes[c.id]]),
    )
    const resultado = await evalStore.guardarBorrador({
      ...form,
      puntajes: puntajesPermitidos,
      finalizar,
    })
    if (finalizar) {
      toastSuccess('Evaluación finalizada. Puede revisar la consolidación.')
    } else {
      const merged = { ...puntajes }
      for (const [k, v] of Object.entries(puntajesPermitidos)) {
        merged[Number(k)] = v
        merged[k] = v
      }
      const siguienteTrasGuardar = faseActual(criteriosActivos.value, merged)
      toastSuccess(
        siguienteTrasGuardar
          ? `Fase guardada. Siguiente turno: «${siguienteTrasGuardar}».`
          : 'Borrador guardado.',
      )
    }
    evalStore.resetBorrador()
    const id = resultado?.id
    if (finalizar) {
      router.push(
        id
          ? { name: 'consolidacion', query: { id } }
          : { name: 'consolidacion' },
      )
    } else if (id) {
      form.id = id
      router.push({ name: 'evaluaciones-pendientes' })
    }
  } catch (e) {
    toastError(e.message || 'No se pudo guardar la evaluación.')
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
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--filasur-border);
}

.step-actions-aviso {
  width: 100%;
  margin: 0;
  padding: 10px 14px;
  font-size: 14px;
  color: #ad4e00;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  text-align: right;
}

.step-actions-btns {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.step-hint {
  margin: 0 0 16px;
  color: var(--filasur-muted);
  font-size: 14px;
}

.mapeo-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 14px;
  background: #fafafa;
  border: 1px solid var(--filasur-border);
  border-radius: 6px;
}

.mapeo-chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid var(--filasur-border);
  color: var(--filasur-text);
}

.puntajes-grid .full {
  grid-column: 1 / -1;
}

.puntaje-row {
  padding: 12px 0;
  border-bottom: 1px solid var(--filasur-border);
}

.puntaje-row:last-of-type {
  border-bottom: none;
}

.puntaje-row-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.area-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #096dd9;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
}

.criterio-nombre {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--filasur-text);
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 500;
}

.area-hint {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  font-weight: normal;
  color: var(--filasur-muted);
}

.puntaje-row .input-invalid {
  border-color: var(--filasur-danger);
  background: #fff2f0;
}

.field-error {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--filasur-danger);
}

.peso {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--filasur-muted);
  font-weight: normal;
}

.resumen {
  padding-left: 18px;
  margin-bottom: 16px;
}

.resumen-tabla {
  margin-top: 8px;
}

.fases-stepper {
  list-style: none;
  display: flex;
  gap: 8px;
  padding: 0;
  margin: 0 0 16px;
}

.fases-stepper li {
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  background: #fafafa;
  color: var(--filasur-muted);
  font-size: 13px;
  border: 1px solid var(--filasur-border);
}

.fases-stepper li span {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--filasur-border);
  margin-right: 6px;
  font-size: 11px;
}

.fases-stepper li.active,
.fases-stepper li.done {
  background: rgba(24, 144, 255, 0.12);
  color: var(--filasur-primary);
  border-color: #91d5ff;
}

.fases-stepper li.active span,
.fases-stepper li.done span {
  background: var(--filasur-primary);
  color: #fff;
}

.fases-stepper li.mine.active {
  font-weight: 600;
}

.aviso-turno {
  padding: 14px 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  color: #ad4e00;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-pendientes {
  color: var(--filasur-primary);
  font-weight: 500;
  text-decoration: none;
  width: fit-content;
}
</style>
