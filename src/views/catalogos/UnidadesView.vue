<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Unidades de medida</h2>
        <p class="page-subtitle">
          {{
            mostrarForm && editandoId
              ? 'Modifique los datos de la unidad'
              : 'Catálogo de unidades para productos y materiales'
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
          Nueva unidad
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
      <h3 class="form-title full">{{ editandoId ? 'Editar unidad' : 'Nueva unidad' }}</h3>
      <div>
        <LabelHint label="Código" hint="Abreviatura usada en productos (ej. KG, UND)." />
        <input
          v-model="form.codigo"
          required
          maxlength="10"
          placeholder="Ej. UND"
          :readonly="!!editandoId"
        />
      </div>
      <div>
        <LabelHint label="Nombre" hint="Nombre descriptivo de la unidad." />
        <input v-model="form.nombre" required placeholder="Ej. Unidad" />
      </div>
      <div class="full">
        <LabelHint label="Descripción" hint="Detalle opcional del uso de la unidad." />
        <input v-model="form.descripcion" placeholder="Ej. Pieza o unidad de venta" />
      </div>
      <div v-if="editandoId">
        <LabelHint label="Estado" hint="Solo las unidades activas aparecen al registrar materiales." />
        <select v-model="form.activo" required>
          <option :value="true">Activo</option>
          <option :value="false">Inactivo</option>
        </select>
      </div>
      <div class="actions full">
        <button class="btn btn-primary" type="submit">
          {{ editandoId ? 'Actualizar unidad' : 'Guardar unidad' }}
        </button>
      </div>
    </form>

    <template v-if="!mostrarForm">
      <div class="card toolbar-row">
        <div class="field grow">
          <LabelHint label="Buscar" hint="Filtra por código o nombre." />
          <input v-model="busqueda" placeholder="Código o nombre..." />
        </div>
      </div>

      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <ThHint label="Código" hint="Abreviatura registrada en el sistema." />
              <ThHint label="Nombre" hint="Nombre completo de la unidad." />
              <ThHint label="Descripción" hint="Uso o detalle de la unidad." />
              <ThHint label="Estado" hint="Activa: disponible al registrar materiales." />
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filtradas" :key="u.id">
              <td><strong>{{ u.codigo }}</strong></td>
              <td>{{ u.nombre }}</td>
              <td>{{ u.descripcion || '—' }}</td>
              <td><StatusBadge :status="u.activo ? 'Activo' : 'Inactivo'" /></td>
              <td>
                <button type="button" class="link-action" @click="editar(u)">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtradas.length" class="empty-state">Sin unidades con los filtros actuales.</p>
        <p class="hint">
          Estas unidades se seleccionan al registrar productos en
          <RouterLink :to="{ name: 'productos' }">Productos / Materiales</RouterLink>.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import { toastError, toastSuccess } from '@/utils/alerts'
import { normalizarUnidades } from '@/utils/unidad'

const unidades = ref([])
const busqueda = ref('')
const mostrarForm = ref(false)
const editandoId = ref(null)
const form = reactive({ codigo: '', nombre: '', descripcion: '', activo: true })

const filtradas = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  if (!q) return unidades.value
  return unidades.value.filter(
    (u) =>
      u.codigo.toLowerCase().includes(q) ||
      u.nombre.toLowerCase().includes(q) ||
      (u.descripcion || '').toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    unidades.value = normalizarUnidades(await api.unidades.listar())
  } catch (e) {
    unidades.value = []
    toastError(e.message || 'No se pudo cargar las unidades.')
  }
})

function resetForm() {
  editandoId.value = null
  Object.assign(form, { codigo: '', nombre: '', descripcion: '', activo: true })
}

function cancelarFormulario() {
  mostrarForm.value = false
  resetForm()
}

function toggleFormulario() {
  if (mostrarForm.value) {
    cancelarFormulario()
    return
  }
  resetForm()
  mostrarForm.value = true
}

function editar(unidad) {
  editandoId.value = unidad.id
  Object.assign(form, {
    codigo: unidad.codigo,
    nombre: unidad.nombre,
    descripcion: unidad.descripcion || '',
    activo: unidad.activo,
  })
  mostrarForm.value = true
}

async function guardar() {
  const codigo = form.codigo.trim().toUpperCase()
  try {
    if (editandoId.value) {
      const actualizada = await api.unidades.actualizar(editandoId.value, {
        codigo,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        activo: form.activo,
      })
      const idx = unidades.value.findIndex((u) => u.id === editandoId.value)
      if (idx !== -1) unidades.value[idx] = actualizada
      toastSuccess('Unidad actualizada correctamente.')
    } else {
      if (unidades.value.some((u) => u.codigo === codigo)) {
        toastError('Ya existe una unidad con ese código.')
        return
      }
      await api.unidades.crear({
        codigo,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
      })
      unidades.value = normalizarUnidades(await api.unidades.listar())
      toastSuccess('Unidad registrada correctamente.')
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
.hint {
  margin-top: 16px;
  font-size: 13px;
  color: var(--filasur-muted);
}
.hint a {
  color: var(--filasur-primary);
  font-weight: 500;
}
input[readonly] {
  background: #f5f5f5;
  color: var(--filasur-muted);
}
</style>
