<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Gestión de usuarios</h2>
        <p class="page-subtitle">Crear, editar y asignar roles a usuarios del sistema</p>
      </div>
      <button type="button" class="btn btn-primary" @click="mostrarForm = !mostrarForm">
        {{ mostrarForm ? 'Cancelar' : '+ Crear usuario' }}
      </button>
    </div>

    <form v-if="mostrarForm" class="card form-grid two" @submit.prevent="crear">
      <div>
        <label>Nombre completo</label>
        <input v-model="nuevo.nombre" required />
      </div>
      <div>
        <label>Correo</label>
        <input v-model="nuevo.email" type="email" required />
      </div>
      <div>
        <label>Rol</label>
        <select v-model="nuevo.rol" required>
          <option value="Compras">Compras</option>
          <option value="Calidad">Calidad</option>
          <option value="Logística">Logística</option>
          <option value="Administrador">Administrador</option>
        </select>
      </div>
      <div class="actions full">
        <button class="btn btn-primary" type="submit">Guardar usuario</button>
      </div>
      <p v-if="mensaje" class="success-text full">{{ mensaje }}</p>
    </form>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.id">
            <td>{{ u.nombre }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.rol }}</td>
            <td><StatusBadge :status="u.estado" /></td>
            <td><span class="link-action">Editar</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const usuarios = ref([])
const mostrarForm = ref(false)
const mensaje = ref('')
const nuevo = reactive({ nombre: '', email: '', rol: 'Compras' })

onMounted(async () => {
  usuarios.value = await api.usuarios.listar()
})

async function crear() {
  const creado = await api.usuarios.crear({ ...nuevo })
  usuarios.value = [creado, ...usuarios.value]
  mensaje.value = 'Usuario creado (mock).'
  mostrarForm.value = false
  Object.assign(nuevo, { nombre: '', email: '', rol: 'Compras' })
}
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; margin-bottom: 8px; }
.page-head .page-subtitle { margin-bottom: 16px; }
.full { grid-column: 1 / -1; }
.actions { display: flex; justify-content: flex-end; }
</style>
