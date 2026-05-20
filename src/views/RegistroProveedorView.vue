<template>
  <div>
    <h2 class="page-title">Registro de proveedor</h2>
    <p class="page-subtitle">Alta de proveedor para el programa de evaluación FILASUR</p>

    <form class="card form-grid two" @submit.prevent="onSubmit">
      <div>
        <label for="ruc">RUC</label>
        <input id="ruc" v-model="form.ruc" required maxlength="11" />
      </div>
      <div>
        <label for="razon">Razón social</label>
        <input id="razon" v-model="form.razonSocial" required />
      </div>
      <div>
        <label for="tipo">Tipo proveedor</label>
        <select id="tipo" v-model="form.tipoProveedor" required>
          <option value="Materia prima">Materia prima</option>
          <option value="Servicio">Servicio</option>
          <option value="Mixto">Mixto</option>
        </select>
      </div>
      <div>
        <label for="rubro">Rubro</label>
        <input id="rubro" v-model="form.rubro" required />
      </div>
      <div>
        <label for="telefono">Teléfono</label>
        <input id="telefono" v-model="form.telefono" />
      </div>
      <div class="full">
        <label for="direccion">Dirección</label>
        <input id="direccion" v-model="form.direccion" />
      </div>
      <div class="full">
        <label>Documentos (simulado)</label>
        <input type="file" multiple disabled />
        <small class="hint">La carga de archivos se habilitará con el backend.</small>
      </div>
      <div>
        <label for="contacto">Contacto</label>
        <input id="contacto" v-model="form.contacto" required />
      </div>
      <div class="full">
        <label for="correo">Correo</label>
        <input id="correo" v-model="form.correo" type="email" required />
      </div>
      <p v-if="mensaje" class="success">{{ mensaje }}</p>
      <p v-if="error" class="error-text">{{ error }}</p>
      <div class="actions full">
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Registrar proveedor' }}
        </button>
      </div>
    </form>

    <section class="card list">
      <div class="list-head">
        <h3>Últimos proveedores registrados</h3>
        <RouterLink class="link-action" :to="{ name: 'proveedores' }">Ver listado completo →</RouterLink>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>RUC</th>
            <th>Razón social</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in proveedores.slice(0, 5)" :key="p.id">
            <td>{{ p.ruc }}</td>
            <td>{{ p.razonSocial }}</td>
            <td>{{ p.tipoProveedor }}</td>
            <td>{{ p.estado }}</td>
            <td>
              <RouterLink class="link-action" :to="{ name: 'detalle-proveedor', params: { id: p.id } }">Ver</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '@/services/api'

const form = reactive({
  ruc: '',
  razonSocial: '',
  tipoProveedor: 'Materia prima',
  rubro: '',
  contacto: '',
  telefono: '',
  correo: '',
  direccion: '',
})

const proveedores = ref([])
const loading = ref(false)
const mensaje = ref('')
const error = ref('')

onMounted(async () => {
  proveedores.value = await api.proveedores.listar()
})

async function onSubmit() {
  loading.value = true
  mensaje.value = ''
  error.value = ''
  try {
    const nuevo = await api.proveedores.registrar({ ...form })
    proveedores.value = [nuevo, ...proveedores.value]
    mensaje.value = 'Proveedor registrado correctamente.'
    Object.assign(form, {
      ruc: '', razonSocial: '', tipoProveedor: 'Materia prima', rubro: '',
      contacto: '', telefono: '', correo: '', direccion: '',
    })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.full {
  grid-column: 1 / -1;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.list {
  margin-top: 16px;
}

.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.list-head h3 { margin: 0; }

.hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--filasur-muted);
}

.success {
  color: var(--filasur-success);
  margin: 0;
}
</style>