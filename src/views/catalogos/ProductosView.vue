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
          hint="Unidades registradas en Catálogos → Unidades. Elija una de la lista."
        />
        <select v-model="form.unidad" required>
          <option value="">Seleccione</option>
          <option v-for="u in unidadesParaSelect" :key="u.id" :value="u.codigo">
            {{ u.codigo }} — {{ u.nombre }}{{ u.activo ? '' : ' (inactiva)' }}
          </option>
        </select>
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
              <td>{{ p.unidad }}</td>
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
import { computed, onMounted, reactive, ref } from 'vue'
import api from '@/services/api'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import { toastError, toastSuccess } from '@/utils/alerts'

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

const unidadesActivas = computed(() => unidades.value.filter((u) => u.activo))

const unidadesParaSelect = computed(() => {
  if (!editandoId.value) return unidadesActivas.value
  const actual = unidades.value.find((u) => u.codigo === form.unidad)
  const activas = unidadesActivas.value
  if (actual && !activas.some((u) => u.id === actual.id)) {
    return [actual, ...activas]
  }
  return activas
})

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

onMounted(async () => {
  await cargarDatos()
})

async function cargarUnidades() {
  try {
    unidades.value = await api.unidades.listar()
  } catch (e) {
    unidades.value = []
    toastError(e.message || 'No se pudo cargar el catálogo de unidades.')
  }
}

async function cargarDatos() {
  const [listaProductos] = await Promise.all([api.productos.listar(), cargarUnidades()])
  productos.value = listaProductos
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
      toastError('No hay unidades activas. Regístrelas en Catálogos → Unidades.')
      return
    }
    resetForm()
    mostrarForm.value = true
  } catch (e) {
    toastError(e.message || 'No se pudo abrir el formulario.')
  }
}

async function editar(producto) {
  await cargarUnidades()
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
  if (!form.unidad || !unidades.value.some((u) => u.codigo === form.unidad)) {
    toastError('Seleccione una unidad del catálogo (Catálogos → Unidades).')
    return
  }
  if (!unidadesActivas.value.some((u) => u.codigo === form.unidad) && !editandoId.value) {
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
</style>
