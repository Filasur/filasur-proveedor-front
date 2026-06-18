<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Gestión de usuarios</h2>
        <p class="page-subtitle">
          {{ mostrarForm && editandoId ? 'Modifique los datos del usuario' : 'Crear, editar y asignar roles a usuarios del sistema' }}
        </p>
      </div>
      <template v-if="!editandoId">
        <button
          v-if="!mostrarForm"
          type="button"
          class="btn btn-primary"
          @click="toggleFormulario"
        >
          Crear usuario
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
      <h3 class="form-title full">{{ editandoId ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
      <div>
        <LabelHint label="Nombre completo" hint="Nombre y apellidos del usuario en el sistema." />
        <input v-model="nuevo.nombre" required />
      </div>
      <div>
        <LabelHint label="Correo" hint="Correo institucional para inicio de sesión y notificaciones." />
        <input v-model="nuevo.email" type="email" required />
      </div>
      <div>
        <LabelHint
          label="Rol"
          hint="Define permisos: Compras, Calidad, Logística o Administrador."
        />
        <select v-model="nuevo.rol" required>
          <option value="Compras">Compras</option>
          <option value="Calidad">Calidad</option>
          <option value="Logística">Logística</option>
          <option value="Administrador">Administrador</option>
        </select>
      </div>
      <div v-if="editandoId">
        <LabelHint label="Estado" hint="Usuario activo puede iniciar sesión; inactivo queda bloqueado." />
        <select v-model="nuevo.estado" required>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
      <div class="actions full">
        <button class="btn btn-primary" type="submit">
          {{ editandoId ? 'Actualizar usuario' : 'Guardar usuario' }}
        </button>
      </div>
    </form>

    <div v-if="!mostrarForm" class="card">
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Nombre" hint="Usuario registrado en el sistema." />
            <ThHint label="Correo" hint="Cuenta de acceso." />
            <ThHint label="Rol" hint="Perfil y permisos asignados." />
            <ThHint label="Estado" hint="Activo o inactivo." />
            <ThHint label="Seguridad" hint="Intentos fallidos y bloqueo temporal por credenciales inválidas." />
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.id">
            <td>{{ u.nombre }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.rol }}</td>
            <td><StatusBadge :status="u.estado" /></td>
            <td>
              <span v-if="u.bloqueado" class="lock-badge">Bloqueado</span>
              <span v-else-if="u.intentosFallidos" class="warning-badge">Con intentos</span>
              <span v-else class="safe-badge">Normal</span>
              <small v-if="u.intentosFallidos" class="attempts">
                {{ u.intentosFallidos }} intento(s)
              </small>
            </td>
            <td>
              <div class="row-actions">
                <button type="button" class="link-action" @click="editar(u)">Editar</button>
                <button
                  v-if="puedeDesbloquear(u)"
                  type="button"
                  class="link-action danger"
                  @click="desbloquear(u)"
                >
                  Desbloquear
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!usuarios.length" class="empty-state">No hay usuarios registrados.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'
import { confirmAction, toastError, toastSuccess } from '@/utils/alerts'

const usuarios = ref([])
const mostrarForm = ref(false)
const editandoId = ref(null)
const nuevo = reactive({ nombre: '', email: '', rol: 'Compras', estado: 'Activo' })

onMounted(async () => {
  usuarios.value = await api.usuarios.listar()
})

function resetNuevo() {
  editandoId.value = null
  Object.assign(nuevo, { nombre: '', email: '', rol: 'Compras', estado: 'Activo' })
}

function cancelarFormulario() {
  mostrarForm.value = false
  resetNuevo()
}

function toggleFormulario() {
  if (mostrarForm.value) {
    cancelarFormulario()
    return
  }
  resetNuevo()
  mostrarForm.value = true
}

function editar(usuario) {
  editandoId.value = usuario.id
  Object.assign(nuevo, {
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    estado: usuario.estado,
  })
  mostrarForm.value = true
}

function puedeDesbloquear(usuario) {
  return Boolean(usuario.bloqueado || Number(usuario.intentosFallidos) > 0)
}

async function guardar() {
  try {
    if (editandoId.value) {
      const actualizado = await api.usuarios.actualizar(editandoId.value, {
        nombre: nuevo.nombre.trim(),
        email: nuevo.email.trim(),
        rol: nuevo.rol,
        estado: nuevo.estado,
      })
      const idx = usuarios.value.findIndex((u) => u.id === editandoId.value)
      if (idx !== -1) usuarios.value[idx] = actualizado
      toastSuccess('Usuario actualizado correctamente.')
    } else {
      await api.usuarios.crear({
        nombre: nuevo.nombre.trim(),
        email: nuevo.email.trim(),
        rol: nuevo.rol,
      })
      usuarios.value = await api.usuarios.listar()
      toastSuccess('Usuario creado correctamente.')
    }
    cancelarFormulario()
  } catch (e) {
    toastError(e.message)
  }
}

async function desbloquear(usuario) {
  const ok = await confirmAction({
    title: '¿Desbloquear usuario?',
    text: `Se limpiarán los intentos fallidos de ${usuario.email}.`,
    icon: 'warning',
    confirmText: 'Desbloquear',
  })
  if (!ok) return

  try {
    const actualizado = await api.usuarios.desbloquear(usuario.id)
    const idx = usuarios.value.findIndex((u) => u.id === usuario.id)
    if (idx !== -1) usuarios.value[idx] = actualizado
    toastSuccess('Usuario desbloqueado correctamente.')
  } catch (e) {
    toastError(e.message || 'No se pudo desbloquear el usuario.')
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
.row-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.link-action.danger {
  color: var(--filasur-danger);
}
.lock-badge,
.safe-badge,
.warning-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.lock-badge {
  color: #a8071a;
  background: #fff1f0;
  border: 1px solid #ffa39e;
}
.safe-badge {
  color: #237804;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}
.warning-badge {
  color: #ad4e00;
  background: #fff7e6;
  border: 1px solid #ffd591;
}
.attempts {
  display: block;
  margin-top: 4px;
  color: var(--filasur-muted);
}
</style>
