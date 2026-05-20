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
        <LabelHint for-id="ruc" label="RUC" hint="Número de RUC del proveedor (11 dígitos)." />
        <input id="ruc" v-model="form.ruc" required maxlength="11" />
      </div>
      <div>
        <LabelHint for-id="razon" label="Razón social" hint="Nombre legal registrado de la empresa." />
        <input id="razon" v-model="form.razonSocial" required />
      </div>
      <div>
        <LabelHint for-id="tipo" label="Tipo proveedor" hint="Materia prima, servicio o mixto." />
        <select id="tipo" v-model="form.tipoProveedor" required>
          <option value="Materia prima">Materia prima</option>
          <option value="Servicio">Servicio</option>
          <option value="Mixto">Mixto</option>
        </select>
      </div>
      <div>
        <LabelHint for-id="rubro" label="Rubro" hint="Giro o sector económico del proveedor." />
        <input id="rubro" v-model="form.rubro" required />
      </div>
      <div>
        <LabelHint for-id="contacto" label="Contacto" hint="Persona de referencia en la empresa." />
        <input id="contacto" v-model="form.contacto" required />
      </div>
      <div>
        <LabelHint for-id="telefono" label="Teléfono" hint="Teléfono de contacto principal." />
        <input id="telefono" v-model="form.telefono" />
      </div>
      <div class="full">
        <LabelHint for-id="correo" label="Correo" hint="Correo electrónico de contacto comercial." />
        <input id="correo" v-model="form.correo" type="email" required />
      </div>
      <div class="full">
        <LabelHint for-id="direccion" label="Dirección" hint="Domicilio fiscal o de operaciones." />
        <input id="direccion" v-model="form.direccion" />
      </div>
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
import { toastError, toastSuccess } from '@/utils/alerts'
import LabelHint from '@/components/ui/LabelHint.vue'

const route = useRoute()
const router = useRouter()
const form = ref(null)
const loading = ref(false)

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
  try {
    await api.proveedores.actualizar(route.params.id, { ...form.value })
    toastSuccess('Proveedor actualizado correctamente.')
    setTimeout(() => router.push({ name: 'detalle-proveedor', params: { id: route.params.id } }), 600)
  } catch (e) {
    toastError(e.message)
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
