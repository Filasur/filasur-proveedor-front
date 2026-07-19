<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Documentos</h2>
        <p class="page-subtitle">Gestión documental asociada a proveedores</p>
      </div>
      <button
        v-if="!mostrarCarga"
        type="button"
        class="btn btn-primary"
        @click="mostrarCarga = true"
      >
        Cargar documentos
      </button>
      <button v-else type="button" class="btn btn-ghost" @click="cancelarCarga">Cancelar</button>
    </div>

    <form v-if="mostrarCarga" class="card form-grid two" @submit.prevent="onSubir">
      <h3 class="form-title full">Cargar documentación de proveedor</h3>
      <div>
        <LabelHint
          label="Proveedor"
          hint="Empresa a la que se asociarán los archivos."
        />
        <select v-model="form.idProveedor" required>
          <option value="" disabled>Seleccionar proveedor</option>
          <option v-for="p in proveedores" :key="p.id" :value="p.id">
            {{ p.razonSocial }} ({{ p.ruc }})
          </option>
        </select>
      </div>
      <div>
        <LabelHint
          label="Categoría"
          hint="Tipo documental de negocio (ficha técnica, certificado, etc.)."
        />
        <select v-model="form.categoria">
          <option value="">Sin categoría</option>
          <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <LabelHint
          label="Fecha de vencimiento"
          hint="Opcional. Útil para certificados o constancias con vigencia."
        />
        <input v-model="form.fechaVencimiento" type="date" />
      </div>
      <div class="full">
        <LabelHint
          label="Archivos"
          hint="PDF, DOC, DOCX, PNG o JPG. Máximo 10 MB por archivo."
        />
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          @change="onArchivosChange"
        />
        <p v-if="archivos.length" class="archivos-hint">
          {{ archivos.length }} archivo(s) seleccionado(s)
        </p>
      </div>
      <div class="actions full">
        <button class="btn btn-primary" type="submit" :disabled="subiendo || !archivos.length">
          {{ subiendo ? 'Subiendo...' : 'Subir documentos' }}
        </button>
      </div>
    </form>

    <div class="card toolbar-row">
      <div class="field grow">
        <LabelHint
          label="Buscar proveedor, archivo o categoría"
          hint="Filtra por razón social, nombre del documento o categoría."
        />
        <input v-model="busqueda" placeholder="Nombre del archivo, proveedor o categoría..." />
      </div>
      <div class="field">
        <LabelHint label="Proveedor" hint="Limita el listado a un proveedor." />
        <select v-model="filtroProveedorId">
          <option value="">Todos</option>
          <option v-for="p in proveedores" :key="p.id" :value="String(p.id)">
            {{ p.razonSocial }}
          </option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Proveedor" hint="Empresa dueña del documento." />
            <ThHint label="Archivo" hint="Nombre del archivo adjunto." />
            <ThHint label="Categoría" hint="Tipo documental de negocio." />
            <ThHint label="Formato" hint="Extensión del archivo (PDF, DOCX, etc.)." />
            <ThHint label="Tamaño" hint="Peso del archivo." />
            <ThHint label="Fecha carga" hint="Fecha en que se subió el documento." />
            <ThHint label="Vencimiento" hint="Fecha de vigencia si aplica." />
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in filtrados" :key="d.id">
            <td>{{ d.proveedor }}</td>
            <td>{{ d.nombre }}</td>
            <td>{{ d.categoria || '—' }}</td>
            <td>{{ d.tipo }}</td>
            <td>{{ d.tamano }}</td>
            <td>{{ d.fecha }}</td>
            <td>{{ d.fechaVencimiento || '—' }}</td>
            <td class="acciones">
              <button
                v-if="puedeDescargar(d)"
                type="button"
                class="link-action btn-link"
                :disabled="descargandoId === d.id"
                @click="onDescargar(d)"
              >
                {{ descargandoId === d.id ? 'Descargando...' : 'Descargar' }}
              </button>
              <button
                type="button"
                class="link-action btn-link danger"
                :disabled="eliminandoId === d.id"
                @click="onEliminar(d)"
              >
                {{ eliminandoId === d.id ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtrados.length" class="empty-state">Sin documentos con los filtros actuales.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '@/services/api'
import { CATEGORIAS_DOCUMENTO, descargarDocumento, puedeDescargarDocumento } from '@/utils/documento'
import { confirmAction, toastError, toastSuccess } from '@/utils/alerts'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'

const documentos = ref([])
const proveedores = ref([])
const categorias = ref([...CATEGORIAS_DOCUMENTO])
const busqueda = ref('')
const filtroProveedorId = ref('')
const descargandoId = ref(null)
const eliminandoId = ref(null)
const mostrarCarga = ref(false)
const subiendo = ref(false)
const archivos = ref([])
const form = ref({
  idProveedor: '',
  categoria: '',
  fechaVencimiento: '',
})

function puedeDescargar(doc) {
  return puedeDescargarDocumento(doc)
}

function onArchivosChange(event) {
  archivos.value = Array.from(event.target.files || [])
}

function cancelarCarga() {
  mostrarCarga.value = false
  archivos.value = []
  form.value = { idProveedor: '', categoria: '', fechaVencimiento: '' }
}

async function cargarDocumentos() {
  const params = {}
  if (filtroProveedorId.value) params.proveedorId = filtroProveedorId.value
  if (busqueda.value.trim()) params.q = busqueda.value.trim()
  documentos.value = await api.documentos.listar(params)
}

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  return documentos.value.filter((d) => {
    const matchProveedor =
      !filtroProveedorId.value || String(d.idProveedor) === String(filtroProveedorId.value)
    const matchQ =
      !q ||
      [d.proveedor, d.nombre, d.categoria, d.tipo]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    return matchProveedor && matchQ
  })
})

async function onDescargar(doc) {
  descargandoId.value = doc.id
  try {
    await descargarDocumento(doc)
  } catch (e) {
    toastError(e.message || 'Error al descargar.')
  } finally {
    descargandoId.value = null
  }
}

async function onEliminar(doc) {
  const ok = await confirmAction({
    title: 'Eliminar documento',
    text: `¿Eliminar "${doc.nombre}"? Esta acción no se puede deshacer.`,
    icon: 'warning',
    confirmText: 'Eliminar',
    danger: true,
  })
  if (!ok) return

  eliminandoId.value = doc.id
  try {
    await api.documentos.eliminar(doc.id)
    documentos.value = documentos.value.filter((d) => d.id !== doc.id)
    toastSuccess('Documento eliminado.')
  } catch (e) {
    toastError(e.message || 'No se pudo eliminar el documento.')
  } finally {
    eliminandoId.value = null
  }
}

async function onSubir() {
  if (!form.value.idProveedor) {
    toastError('Seleccione un proveedor.')
    return
  }
  if (!archivos.value.length) {
    toastError('Seleccione al menos un archivo.')
    return
  }

  subiendo.value = true
  try {
    await api.proveedores.subirDocumentos(Number(form.value.idProveedor), archivos.value, {
      categoria: form.value.categoria || undefined,
      fechaVencimiento: form.value.fechaVencimiento || undefined,
    })
    toastSuccess('Documentos cargados correctamente.')
    cancelarCarga()
    await cargarDocumentos()
  } catch (e) {
    toastError(e.message || 'No se pudieron subir los documentos.')
  } finally {
    subiendo.value = false
  }
}

watch(filtroProveedorId, () => {
  cargarDocumentos().catch((e) => toastError(e.message))
})

onMounted(async () => {
  try {
    const [listaDocs, listaProv, cats] = await Promise.all([
      api.documentos.listar(),
      api.proveedores.listar(),
      api.documentos.categorias().catch(() => CATEGORIAS_DOCUMENTO),
    ])
    documentos.value = listaDocs
    proveedores.value = listaProv
    if (Array.isArray(cats) && cats.length) categorias.value = cats
  } catch (e) {
    toastError(e.message || 'No se pudo cargar la gestión documental.')
  }
})
</script>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}
.form-title {
  margin: 0 0 4px;
  font-size: 16px;
}
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
.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.btn-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
}
.btn-link.danger {
  color: var(--filasur-danger, #cf1322);
}
</style>
