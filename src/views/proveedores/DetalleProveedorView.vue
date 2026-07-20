<template>
  <div>
    <nav class="breadcrumbs">
      <RouterLink :to="{ name: 'proveedores' }">Proveedores</RouterLink>
      <span>/</span>
      <span>{{ proveedor?.razonSocial || '...' }}</span>
    </nav>

    <div v-if="loading" class="card empty-state">Cargando...</div>
    <div v-else-if="proveedor" class="two-col-layout">
      <aside>
        <article class="card profile-card">
          <div class="logo-placeholder">{{ iniciales }}</div>
          <h3>{{ proveedor.razonSocial }}</h3>
          <p><strong>RUC:</strong> {{ proveedor.ruc }}</p>
          <p><strong>Teléfono:</strong> {{ proveedor.telefono }}</p>
          <p><strong>Correo:</strong> <a :href="`mailto:${proveedor.correo}`">{{ proveedor.correo }}</a></p>
          <p><strong>Dirección:</strong> {{ proveedor.direccion }}</p>
          <StatusBadge :status="proveedor.estado === 'Aprobado' ? 'Proveedor aprobado' : proveedor.estado" />
        </article>
        <nav class="card side-nav">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            class="side-nav-item"
            :class="{ active: tab === t.id }"
            @click="tab = t.id"
          >
            {{ t.label }}
          </button>
        </nav>
      </aside>

      <section>
        <div v-if="tab === 'info'" class="card">
          <div class="section-head">
            <h3>Información general</h3>
            <RouterLink class="btn btn-ghost" :to="{ name: 'editar-proveedor', params: { id: proveedor.id } }">Editar</RouterLink>
          </div>
          <dl class="info-grid">
            <div><dt>Tipo proveedor</dt><dd>{{ proveedor.tipoProveedor }}</dd></div>
            <div><dt>Rubro</dt><dd>{{ proveedor.rubro }}</dd></div>
            <div><dt>Contacto</dt><dd>{{ proveedor.contacto }}</dd></div>
            <div>
              <dt class="dt-hint">
                Clasificación
                <AppTooltip
                  text="Nivel de desempeño según evaluaciones históricas: A (mejor), B (medio), C (bajo). Distinto del estado del trámite."
                />
              </dt>
              <dd>{{ proveedor.clasificacion }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="tab === 'evaluaciones'" class="card">
          <h3>Evaluaciones del proveedor</h3>
          <table class="data-table">
            <thead>
              <tr>
                <ThHint label="Producto" hint="Material evaluado en el proceso." />
                <ThHint label="Orden compra" hint="Referencia de la OC asociada." />
                <ThHint label="Puntaje" hint="Resultado consolidado de la evaluación." />
                <ThHint label="Estado" hint="En proceso, aprobado, rechazado, etc." />
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in proveedor.evaluaciones" :key="e.id">
                <td>{{ e.producto }}</td>
                <td>{{ e.ordenCompra || '-' }}</td>
                <td>{{ e.puntajeFinal ?? '-' }}</td>
                <td><StatusBadge :status="e.estado" /></td>
                <td>
                  <RouterLink class="link-action" :to="{ name: 'consolidacion', query: { id: e.id } }">Ver</RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="tab === 'documentos'" class="card">
          <div class="section-head">
            <h3>Documentos</h3>
            <button
              v-if="puedeGestionarDocs"
              type="button"
              class="btn btn-ghost"
              @click="mostrarCarga = !mostrarCarga"
            >
              {{ mostrarCarga ? 'Cancelar' : 'Cargar documentos' }}
            </button>
          </div>

          <form v-if="mostrarCarga && puedeGestionarDocs" class="upload-form" @submit.prevent="onSubirDocs">
            <div class="form-grid two">
              <div>
                <LabelHint label="Categoría" hint="Tipo documental de negocio." />
                <select v-model="carga.categoria">
                  <option value="">Sin categoría</option>
                  <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <LabelHint label="Fecha de vencimiento" hint="Opcional, para certificados con vigencia." />
                <input v-model="carga.fechaVencimiento" type="date" />
              </div>
              <div class="full">
                <LabelHint label="Archivos" hint="PDF, DOC, DOCX, PNG o JPG. Máximo 10 MB." />
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
            </div>
            <div class="upload-actions">
              <button class="btn btn-primary" type="submit" :disabled="subiendo || !archivos.length">
                {{ subiendo ? 'Subiendo...' : 'Subir' }}
              </button>
            </div>
          </form>

          <ul class="doc-list">
            <li v-for="d in proveedor.documentos" :key="d.id">
              <span class="doc-icon">{{ d.tipo || 'DOC' }}</span>
              <div class="doc-info">
                <strong>{{ d.nombre }}</strong>
                <small>
                  {{ d.categoria ? `${d.categoria} · ` : '' }}{{ d.tipo }} · {{ d.tamano }}
                  · Carga: {{ d.fecha }}
                  <template v-if="d.fechaVencimiento"> · Vence: {{ d.fechaVencimiento }}</template>
                </small>
              </div>
              <div class="doc-actions">
                <button
                  v-if="puedeDescargarDoc(d)"
                  type="button"
                  class="link-action btn-link"
                  @click="onDescargarDoc(d)"
                >
                  Descargar
                </button>
                <button
                  v-if="puedeGestionarDocs"
                  type="button"
                  class="link-action btn-link danger"
                  @click="onEliminarDoc(d)"
                >
                  Eliminar
                </button>
              </div>
            </li>
          </ul>
          <p v-if="!proveedor.documentos?.length" class="empty-state">Sin documentos adjuntos.</p>
        </div>

        <div v-if="tab === 'historial'" class="card">
          <h3>Bitácora del proveedor</h3>
          <ul class="timeline">
            <li v-for="h in proveedor.historial" :key="h.id">
              <time>{{ h.fecha }}</time>
              <strong> - {{ h.accion }}</strong>
              <p>{{ h.detalle }}</p>
            </li>
          </ul>
          <p v-if="!proveedor.historial?.length" class="empty-state">Sin acciones registradas para este proveedor.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { ROLE_GROUPS, MODULOS, hasAccess } from '@/security/permissions'
import { CATEGORIAS_DOCUMENTO, descargarDocumento, puedeDescargarDocumento } from '@/utils/documento'
import { confirmAction, toastError, toastSuccess } from '@/utils/alerts'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AppTooltip from '@/components/ui/AppTooltip.vue'
import ThHint from '@/components/ui/ThHint.vue'
import LabelHint from '@/components/ui/LabelHint.vue'

const route = useRoute()
const auth = useAuthStore()
const proveedor = ref(null)
const loading = ref(true)
const tab = ref('info')
const mostrarCarga = ref(false)
const subiendo = ref(false)
const archivos = ref([])
const categorias = ref([...CATEGORIAS_DOCUMENTO])
const carga = ref({ categoria: '', fechaVencimiento: '' })

const tabs = [
  { id: 'info', label: 'Información general' },
  { id: 'evaluaciones', label: 'Evaluaciones' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'historial', label: 'Bitácora' },
]

const puedeGestionarDocs = computed(() =>
  hasAccess(auth.user, { roles: ROLE_GROUPS.documentos, modulo: MODULOS.documentos }),
)

const iniciales = computed(() =>
  (proveedor.value?.razonSocial || 'PR')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
)

function puedeDescargarDoc(doc) {
  return puedeDescargarDocumento(doc)
}

function onArchivosChange(event) {
  archivos.value = Array.from(event.target.files || [])
}

async function onDescargarDoc(doc) {
  try {
    await descargarDocumento(doc)
  } catch (e) {
    toastError(e.message || 'Error al descargar.')
  }
}

async function onEliminarDoc(doc) {
  const ok = await confirmAction({
    title: 'Eliminar documento',
    text: `¿Eliminar "${doc.nombre}"?`,
    icon: 'warning',
    confirmText: 'Eliminar',
    danger: true,
  })
  if (!ok) return

  try {
    await api.documentos.eliminar(doc.id)
    proveedor.value.documentos = (proveedor.value.documentos || []).filter((d) => d.id !== doc.id)
    toastSuccess('Documento eliminado.')
  } catch (e) {
    toastError(e.message || 'No se pudo eliminar.')
  }
}

async function onSubirDocs() {
  if (!archivos.value.length) {
    toastError('Seleccione al menos un archivo.')
    return
  }
  subiendo.value = true
  try {
    await api.proveedores.subirDocumentos(proveedor.value.id, archivos.value, {
      categoria: carga.value.categoria || undefined,
      fechaVencimiento: carga.value.fechaVencimiento || undefined,
    })
    toastSuccess('Documentos cargados.')
    mostrarCarga.value = false
    archivos.value = []
    carga.value = { categoria: '', fechaVencimiento: '' }
    proveedor.value = await api.proveedores.obtener(route.params.id)
  } catch (e) {
    toastError(e.message || 'No se pudieron subir los documentos.')
  } finally {
    subiendo.value = false
  }
}

onMounted(async () => {
  try {
    if (!auth.token) auth.hydrateFromStorage()
    const [p, cats] = await Promise.all([
      api.proveedores.obtener(route.params.id),
      api.documentos.categorias().catch(() => CATEGORIAS_DOCUMENTO),
    ])
    proveedor.value = p
    if (Array.isArray(cats) && cats.length) categorias.value = cats
  } catch (e) {
    toastError(e.message || 'No se pudo cargar el proveedor.')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.breadcrumbs { margin-bottom: 16px; font-size: 14px; color: var(--filasur-muted); }
.breadcrumbs a { color: var(--filasur-primary); }
.profile-card { text-align: center; margin-bottom: 12px; }
.logo-placeholder {
  width: 72px; height: 72px; margin: 0 auto 12px;
  background: #f0f2f5; border-radius: 8px;
  display: grid; place-items: center; font-weight: 700; color: var(--filasur-muted);
}
.profile-card h3 { margin: 8px 0; font-size: 16px; }
.profile-card p { font-size: 13px; text-align: left; margin: 6px 0; }
.side-nav { padding: 8px; }
.side-nav-item {
  display: block; width: 100%; text-align: left;
  padding: 10px 12px; border: none; background: none;
  border-radius: 6px; cursor: pointer; color: var(--filasur-text);
}
.side-nav-item.active { background: #e6f7ff; color: var(--filasur-primary); }
.section-head { display: flex; justify-content: space-between; align-items: center; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.info-grid dt { font-size: 12px; color: var(--filasur-muted); }
.dt-hint { display: inline-flex; align-items: center; gap: 6px; }
.info-grid dd { margin: 4px 0 0; }
.doc-list { list-style: none; padding: 0; margin: 0; }
.doc-list li {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--filasur-border);
}
.doc-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.doc-info small { color: var(--filasur-muted); }
.doc-actions { display: flex; gap: 12px; flex-shrink: 0; }
.btn-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
}
.btn-link.danger { color: var(--filasur-danger, #cf1322); }
.doc-icon { background: #fff2f0; color: #cf1322; padding: 8px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; }
.upload-form { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--filasur-border); }
.upload-form .full { grid-column: 1 / -1; }
.upload-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
.archivos-hint { margin: 8px 0 0; font-size: 13px; color: var(--filasur-muted); }
.timeline { list-style: none; padding: 0; }
.timeline li { padding: 12px 0; border-bottom: 1px solid var(--filasur-border); }
.timeline time { font-size: 12px; color: var(--filasur-muted); }
.timeline p { margin: 4px 0 0; font-size: 13px; color: var(--filasur-muted); }
</style>
