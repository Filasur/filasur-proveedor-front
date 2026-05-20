<template>
  <div>
    <h2 class="page-title">Registro de proveedor</h2>
    <p class="page-subtitle">Alta de proveedor para el programa de evaluación FILASUR</p>

    <form class="card form-grid two" @submit.prevent="onSubmit">
      <div>
        <LabelHint for-id="ruc" label="RUC" hint="Número de RUC del proveedor (11 dígitos)." />
        <input id="ruc" v-model="form.ruc" required maxlength="11" />
      </div>
      <div>
        <LabelHint for-id="razon" label="Razón social" hint="Nombre legal registrado de la empresa." />
        <input id="razon" v-model="form.razonSocial" required />
      </div>
      <div>
        <LabelHint
          for-id="tipo"
          label="Tipo proveedor"
          hint="Indica si suministra materia prima, servicios o ambos."
        />
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
        <LabelHint for-id="telefono" label="Teléfono" hint="Teléfono de contacto principal." />
        <input id="telefono" v-model="form.telefono" />
      </div>
      <div class="full">
        <LabelHint for-id="direccion" label="Dirección" hint="Domicilio fiscal o de operaciones." />
        <input id="direccion" v-model="form.direccion" />
      </div>
      <div class="full">
        <LabelHint
          label="Documentos"
          hint="Fichas técnicas, certificados u otros PDF."
        />
        <input type="file" multiple disabled />
      </div>
      <div>
        <LabelHint for-id="contacto" label="Contacto" hint="Persona de referencia en la empresa." />
        <input id="contacto" v-model="form.contacto" required />
      </div>
      <div class="full">
        <LabelHint for-id="correo" label="Correo" hint="Correo electrónico de contacto comercial." />
        <input id="correo" v-model="form.correo" type="email" required />
      </div>
      <div class="actions full">
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Registrar proveedor' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '@/services/api'
import { toastError, toastSuccess } from '@/utils/alerts'
import LabelHint from '@/components/ui/LabelHint.vue'

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

const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await api.proveedores.registrar({ ...form })
    toastSuccess('Proveedor registrado correctamente.')
    Object.assign(form, {
      ruc: '', razonSocial: '', tipoProveedor: 'Materia prima', rubro: '',
      contacto: '', telefono: '', correo: '', direccion: '',
    })
  } catch (e) {
    toastError(e.message)
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
</style>
