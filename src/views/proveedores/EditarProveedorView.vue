<template>
  <div>
    <nav class="breadcrumbs">
      <RouterLink :to="{ name: 'proveedores' }">Proveedores</RouterLink>
      <span>/</span>
      <RouterLink :to="{ name: 'detalle-proveedor', params: { id: route.params.id } }">Detalle</RouterLink>
      <span>/</span>
      <span>Editar</span>
    </nav>

    <h2 class="page-title">Actualizar proveedor</h2>
    <p class="page-subtitle">Modificar datos del proveedor registrado</p>

    <form v-if="form" class="card form-grid two" @submit.prevent="onSubmit">
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
        <label for="contacto">Contacto</label>
        <input id="contacto" v-model="form.contacto" required />
      </div>
      <div>
        <label for="telefono">Teléfono</label>
        <input id="telefono" v-model="form.telefono" />
      </div>
      <div class="full">
        <label for="correo">Correo</label>
        <input id="correo" v-model="form.correo" type="email" required />
      </div>
      <div class="full">
        <label for="direccion">Dirección</label>
        <input id="direccion" v-model="form.direccion" />
      </div>
      <p v-if="mensaje" class="success-text full">{{ mensaje }}</p>
      <p v-if="error" class="error-text full">{{ error }}</p>
      <div class="actions full">
        <RouterLink class="btn btn-ghost" :to="{ name: 'detalle-proveedor', params: { id: route.params.id } }">Cancelar</RouterLink>
        <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Guardando...' : 'Guardar cambios' }}</button>
      </div>
    </form>
    <div v-else class="card empty-state">Cargando...</div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const form = ref(null)
const loading = ref(false)
const mensaje = ref('')
const error = ref('')

onMounted(async () => {
  const p = await api.proveedores.obtener(route.params.id)
  form.value = {
    ruc: p.ruc,
    razonSocial: p.razonSocial,
    tipoProveedor: p.tipoProveedor,
    rubro: p.rubro,
    contacto: p.contacto,
    telefono: p.telefono,
    correo: p.correo,
    direccion: p.direccion,
  }
})

async function onSubmit() {
  loading.value = true
  mensaje.value = ''
  error.value = ''
  try {
    await api.proveedores.actualizar(route.params.id, { ...form.value })
    mensaje.value = 'Proveedor actualizado correctamente.'
    setTimeout(() => router.push({ name: 'detalle-proveedor', params: { id: route.params.id } }), 800)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.breadcrumbs { margin-bottom: 16px; font-size: 14px; color: var(--filasur-muted); }
.breadcrumbs a { color: var(--filasur-primary); }
.full { grid-column: 1 / -1; }
.actions { display: flex; justify-content: flex-end; gap: 12px; }
</style>
