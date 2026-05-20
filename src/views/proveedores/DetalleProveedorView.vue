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
            <div><dt>Clasificación</dt><dd>{{ proveedor.clasificacion }}</dd></div>
          </dl>
        </div>

        <div v-if="tab === 'evaluaciones'" class="card">
          <h3>Evaluaciones del proveedor</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Orden compra</th>
                <th>Puntaje</th>
                <th>Estado</th>
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
          <h3>Documentos</h3>
          <ul class="doc-list">
            <li v-for="d in proveedor.documentos" :key="d.id">
              <span class="doc-icon">PDF</span>
              <div>
                <strong>{{ d.nombre }}</strong>
                <small>{{ d.tipo }} · {{ d.tamano }}</small>
              </div>
            </li>
          </ul>
          <p v-if="!proveedor.documentos?.length" class="empty-state">Sin documentos adjuntos.</p>
        </div>

        <div v-if="tab === 'historial'" class="card">
          <h3>Historial</h3>
          <ul class="timeline">
            <li v-for="h in proveedor.historial" :key="h.id">
              <time>{{ h.fecha }}</time>
              <strong>{{ h.accion }}</strong>
              <p>{{ h.detalle }}</p>
            </li>
          </ul>
          <p v-if="!proveedor.historial?.length" class="empty-state">Sin registros de historial.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const route = useRoute()
const proveedor = ref(null)
const loading = ref(true)
const tab = ref('info')
const tabs = [
  { id: 'info', label: 'Información general' },
  { id: 'evaluaciones', label: 'Evaluaciones' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'historial', label: 'Historial' },
]

const iniciales = computed(() =>
  (proveedor.value?.razonSocial || 'PR')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
)

onMounted(async () => {
  proveedor.value = await api.proveedores.obtener(route.params.id)
  loading.value = false
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
.info-grid dd { margin: 4px 0 0; }
.doc-list { list-style: none; padding: 0; margin: 0; }
.doc-list li { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--filasur-border); }
.doc-icon { background: #fff2f0; color: #cf1322; padding: 8px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; }
.timeline { list-style: none; padding: 0; }
.timeline li { padding: 12px 0; border-bottom: 1px solid var(--filasur-border); }
.timeline time { font-size: 12px; color: var(--filasur-muted); }
.timeline p { margin: 4px 0 0; font-size: 13px; color: var(--filasur-muted); }
</style>
