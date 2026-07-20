<template>
  <div>
    <h2 class="page-title">Gestión de roles</h2>
    <p class="page-subtitle">
      Los módulos marcados aquí controlan qué ve cada rol en el menú al iniciar sesión
      (tabla <code>RolModulo</code>). El módulo <strong>Todos</strong> da acceso completo.
    </p>

    <div class="roles-grid">
      <article v-for="r in roles" :key="r.id" class="card role-card">
        <h3>{{ r.nombre }}</h3>
        <p>{{ r.descripcion }}</p>
        <div class="modulos">
          <span v-for="m in r.modulos" :key="m" class="mod-tag">{{ m }}</span>
        </div>
        <button type="button" class="btn btn-ghost" @click="editar(r)">Editar permisos</button>
      </article>
    </div>

    <section v-if="rolEditando" class="card editor">
      <h3>Editar permisos: {{ rolEditando.nombre }}</h3>
      <div class="checks">
        <label v-for="m in modulosDisponibles" :key="m" class="check-item">
          <input v-model="modulosSeleccionados" type="checkbox" :value="m" />
          {{ m }}
        </label>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-ghost" @click="cancelar">Cancelar</button>
        <button type="button" class="btn btn-primary" :disabled="saving" @click="guardar">
          {{ saving ? 'Guardando...' : 'Guardar permisos' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'
import { toastError, toastSuccess } from '@/utils/alerts'

const roles = ref([])
const rolEditando = ref(null)
const modulosSeleccionados = ref([])
const saving = ref(false)
const modulosDisponibles = ['Todos', 'Proveedores', 'Evaluaciones', 'Reportes', 'Criterios', 'Unidades', 'Productos', 'Documentos', 'Usuarios', 'Roles', 'Configuración', 'Bitácora']

async function cargar() {
  roles.value = await api.roles.listar()
}

function editar(rol) {
  rolEditando.value = rol
  modulosSeleccionados.value = [...(rol.modulos || [])]
}

function cancelar() {
  rolEditando.value = null
  modulosSeleccionados.value = []
}

async function guardar() {
  saving.value = true
  try {
    await api.roles.actualizarModulos(rolEditando.value.id, modulosSeleccionados.value)
    await cargar()
    toastSuccess('Permisos actualizados.')
    cancelar()
  } catch (e) {
    toastError(e.message || 'No se pudieron actualizar los permisos.')
  } finally {
    saving.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.role-card h3 { margin: 0 0 8px; }
.role-card p { color: var(--filasur-muted); font-size: 14px; margin: 0 0 12px; }
.modulos { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.mod-tag {
  background: #e6f7ff;
  color: #096dd9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.editor { margin-top: 16px; }
.editor h3 { margin-top: 0; }
.checks { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; margin-bottom: 16px; }
.check-item { display: flex; gap: 8px; align-items: center; font-size: 14px; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
