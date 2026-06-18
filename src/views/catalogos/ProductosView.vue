<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Productos / Materiales</h2>
        <p class="page-subtitle">
          {{
            mostrarForm && editandoId
              ? 'Modifique los datos del material'
              : 'Catálogo de materiales evaluables'
          }}
        </p>
      </div>
      <template v-if="!editandoId">
        <button
          v-if="!mostrarForm"
          type="button"
          class="btn btn-primary"
          @click="toggleFormulario"
        >
          Nuevo material
        </button>
        <button v-else type="button" class="btn btn-ghost" @click="toggleFormulario">
          Cancelar
        </button>
      </template>
      <button v-else type="button" class="btn btn-ghost" @click="cancelarFormulario">
        Cancelar
      </button>
    </div>

    <form v-if="mostrarForm" class="card form-grid two" @submit.prevent="guardar">
      <h3 class="form-title full">{{ editandoId ? 'Editar material' : 'Nuevo material' }}</h3>
      <div>
        <LabelHint label="Código" hint="Identificador único del material (ej. MAT-BOL-PP-50)." />
        <input
          v-model="form.codigo"
          required
          placeholder="Ej. MAT-XXX-001"
          :readonly="!!editandoId"
        />
      </div>
      <div>
        <LabelHint label="Nombre" hint="Descripción del producto o material." />
        <input v-model="form.nombre" required placeholder="Ej. Bolsa PP 50kg" />
      </div>
      <div>
        <LabelHint label="Categoría" hint="Grupo o familia del material." />
        <select v-model="form.categoria" required>
          <option value="">Seleccione</option>
          <option v-for="c in categoriasParaSelect" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <LabelHint
          label="Unidad"
          hint="Mismo catálogo que Unidades de medida. Las inactivas aparecen pero no se pueden usar en materiales nuevos."
        />
        <select v-model="form.unidad" required :disabled="!unidadesCatalogo.length">
          <option value="">
            {{
              unidadesCatalogo.length
                ? 'Seleccione unidad'
                : 'Sin unidades — créelas en Catálogos → Unidades'
            }}
          </option>
          <option
            v-for="u in unidadesCatalogo"
            :key="u.id"
            :value="u.codigo"
            :disabled="!editandoId && !esUnidadActiva(u)"
          >
            {{ etiquetaUnidad(u) }}
          </option>
        </select>
        <p v-if="unidadesCatalogo.length && !unidadesActivas.length" class="field-hint warn">
          Hay unidades en el catálogo, pero ninguna está activa. Active al menos una en Unidades.
        </p>
      </div>
      <div class="actions full">
        <button class="btn btn-primary" type="submit" :disabled="!unidadesActivas.length">
          {{ editandoId ? 'Actualizar material' : 'Guardar material' }}
        </button>
      </div>
    </form>

    <template v-if="!mostrarForm">
      <div class="card toolbar-row">
        <div class="field grow">
          <LabelHint label="Buscar" hint="Filtra por código interno o nombre del material." />
          <input v-model="busqueda" placeholder="Código o nombre..." />
        </div>
      </div>

      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <ThHint label="Código" hint="Identificador único del material." />
              <ThHint label="Nombre" hint="Descripción del producto o material." />
              <ThHint label="Categoría" hint="Grupo o familia del material." />
              <ThHint label="Unidad" hint="Unidad de medida (kg, und, m, etc.)." />
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtrados" :key="p.id">
              <td>{{ p.codigo }}</td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.categoria }}</td>
              <td>{{ textoUnidad(p.unidad) }}</td>
              <td>
                <button type="button" class="link-action" @click="editar(p)">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtrados.length" class="empty-state">Sin materiales con los filtros actuales.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onActivated, onMounted, reactive, ref } from 'vue'
import api from '@/services/api'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import { toastError, toastSuccess } from '@/utils/alerts'
import {
  esUnidadActiva,
  etiquetaUnidad,
  normalizarUnidades,
  unidadPorCodigo,
} from '@/utils/unidad'

const productos = ref([])
const unidades = ref([])
const busqueda = ref('')
const mostrarForm = ref(false)
const editandoId = ref(null)
const CATEGORIAS_BASE = ['Embalaje', 'Insumo', 'Materia prima', 'Químico', 'Servicio', 'Textil']

const form = reactive({ codigo: '', nombre: '', categoria: '', unidad: '' })

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return productos.value.filter(
    (p) => !q || p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q)
  )
})

const unidadesActivas = computed(() => unidades.value.filter(esUnidadActiva))

/** Mismo listado completo que la tabla en Catálogos → Unidades (orden por código). */
const unidadesCatalogo = computed(() =>
  [...unidades.value].sort((a, b) => a.codigo.localeCompare(b.codigo, 'es'))
)

function textoUnidad(codigo) {
  const u = unidadPorCodigo(unidades.value, codigo)
  return u ? etiquetaUnidad(u) : codigo || '—'
}

const categoriasParaSelect = computed(() => {
  const set = new Set(CATEGORIAS_BASE)
  productos.value.forEach((p) => {
    const c = p.categoria?.trim()
    if (c) set.add(c)
  })
  const actual = form.categoria?.trim()
  if (actual) set.add(actual)
  return [...set].sort((a, b) => a.localeCompare(b, 'es'))
})

onMounted(() => cargarDatos())
onActivated(async () => {
  try {
    await cargarUnidades()
  } catch {
    /* al volver de Unidades sin conexión, no bloquear la tabla de productos */
  }
})

async function cargarUnidades() {
  const lista = await api.unidades.listar()
  const normalizadas = normalizarUnidades(lista)
  if (!normalizadas.length) {
    throw new Error('No hay unidades en el catálogo. Regístrelas en Catálogos → Unidades.')
  }
  unidades.value = normalizadas
}

async function cargarDatos() {
  try {
    const [listaProductos] = await Promise.all([api.productos.listar(), cargarUnidades()])
    productos.value = listaProductos
  } catch (e) {
    productos.value = await api.productos.listar().catch(() => [])
    unidades.value = []
    toastError(e.message || 'No se pudieron cargar productos o unidades.')
  }
}

function resetForm() {
  editandoId.value = null
  const primeraUnidad = unidadesActivas.value[0]
  const primeraCategoria = categoriasParaSelect.value[0] || ''
  Object.assign(form, {
    codigo: '',
    nombre: '',
    categoria: primeraCategoria,
    unidad: primeraUnidad?.codigo || '',
  })
}

function cancelarFormulario() {
  mostrarForm.value = false
  resetForm()
}

async function toggleFormulario() {
  if (mostrarForm.value) {
    cancelarFormulario()
    return
  }
  try {
    await cargarUnidades()
    if (!unidadesActivas.value.length) {
      toastError('No hay unidades activas. Active o cree unidades en Catálogos → Unidades.')
      return
    }
    resetForm()
    mostrarForm.value = true
  } catch (e) {
    unidades.value = []
    toastError(e.message || 'No se pudo cargar el catálogo de unidades.')
  }
}

async function editar(producto) {
  try {
    await cargarUnidades()
  } catch (e) {
    toastError(e.message || 'No se pudo cargar el catálogo de unidades.')
    return
  }
  editandoId.value = producto.id
  Object.assign(form, {
    codigo: producto.codigo,
    nombre: producto.nombre,
    categoria: producto.categoria,
    unidad: producto.unidad,
  })
  mostrarForm.value = true
}

async function guardar() {
  const codigo = form.codigo.trim().toUpperCase()
  if (!form.categoria) {
    toastError('Seleccione una categoría.')
    return
  }
  const unidadSel = unidadPorCodigo(unidades.value, form.unidad)
  if (!unidadSel) {
    toastError('Seleccione una unidad del catálogo (Catálogos → Unidades).')
    return
  }
  if (!esUnidadActiva(unidadSel) && !editandoId.value) {
    toastError('La unidad seleccionada está inactiva. Active o elija otra en Unidades.')
    return
  }
  try {
    if (editandoId.value) {
      const actualizado = await api.productos.actualizar(editandoId.value, {
        codigo,
        nombre: form.nombre.trim(),
        categoria: form.categoria.trim(),
        unidad: form.unidad,
      })
      const idx = productos.value.findIndex((p) => p.id === editandoId.value)
      if (idx !== -1) productos.value[idx] = actualizado
      toastSuccess('Material actualizado correctamente.')
    } else {
      if (productos.value.some((p) => p.codigo.toUpperCase() === codigo)) {
        toastError('Ya existe un material con ese código.')
        return
      }
      if (!unidadesActivas.value.length) {
        toastError('No hay unidades activas. Regístrelas en Catálogos → Unidades.')
        return
      }
      await api.productos.crear({
        codigo,
        nombre: form.nombre.trim(),
        categoria: form.categoria.trim(),
        unidad: form.unidad,
      })
      productos.value = await api.productos.listar()
      toastSuccess('Material registrado correctamente.')
    }
    cancelarFormulario()
  } catch (e) {
    toastError(e.message)
  }
}
</script>

<style scoped>
.full {
  grid-column: 1 / -1;
}
.form-title {
  margin: 0 0 4px;
  font-size: 16px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.link-action {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
input[readonly] {
  background: #f5f5f5;
  color: var(--filasur-muted);
}
.field-hint.warn {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--filasur-danger);
}
</style>
