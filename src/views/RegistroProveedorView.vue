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
        <select id="tipo" v-model="form.idTipoProveedor" required>
          <option value="" disabled>Seleccionar tipo</option>
          <option :value="1">Materia prima</option>
          <option :value="2">Servicio</option>
          <option :value="3">Mixto</option>
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
        <input
          id="documentos"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          @change="onArchivosChange"
        />
        <p v-if="archivos.length" class="archivos-hint">
          {{ archivos.length }} archivo(s) seleccionado(s)
        </p>
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
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { toastError, toastSuccess } from '@/utils/alerts'
import LabelHint from '@/components/ui/LabelHint.vue'

const form = reactive({
  ruc: '',
  razonSocial: '',
  idTipoProveedor: '',
  rubro: '',
  contacto: '',
  telefono: '',
  correo: '',
  direccion: '',
})

const router = useRouter()
const loading = ref(false)
const archivos = ref([])

function onArchivosChange(event) {
  archivos.value = Array.from(event.target.files || [])
}

async function onSubmit() {
  if (form.idTipoProveedor === '' || form.idTipoProveedor == null) {
    toastError('Seleccione el tipo de proveedor.')
    return
  }
  loading.value = true
  try {
    const { idTipoProveedor, ...resto } = form
    const resultado = await api.proveedores.registrar({
      ...resto,
      idTipoProveedor: Number(idTipoProveedor),
    })
    const idProveedor = resultado?.id
    if (idProveedor && archivos.value.length) {
      await api.proveedores.subirDocumentos(idProveedor, archivos.value)
    }
    toastSuccess('Proveedor registrado correctamente.')
    router.push({ name: 'proveedores' })
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

.archivos-hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--filasur-muted);
}
</style>
