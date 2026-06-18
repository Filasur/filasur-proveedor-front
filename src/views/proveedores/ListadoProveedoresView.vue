<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Listado de proveedores</h2>
        <p class="page-subtitle">Buscar, filtrar y consultar proveedores registrados</p>
      </div>
      <RouterLink :to="{ name: 'registro-proveedor' }" class="btn btn-primary">Registrar proveedor</RouterLink>
    </div>

    <div class="card toolbar-row">
      <div class="field grow">
        <LabelHint
          label="Buscar"
          hint="Filtra por RUC, nombre de empresa o rubro de actividad."
        />
        <input v-model="busqueda" placeholder="RUC, razón social o rubro..." />
      </div>
      <div class="field">
        <LabelHint
          label="Estado"
          hint="Situación del proveedor en el proceso (registro, evaluación, aprobación)."
        />
        <select v-model="filtroEstado">
          <option value="">Todos</option>
          <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="empty-state">Cargando proveedores...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <ThHint label="RUC" hint="Registro Único de Contribuyentes (11 dígitos)." />
            <ThHint label="Razón social" hint="Nombre legal de la empresa proveedora." />
            <ThHint label="Tipo" hint="Materia prima, servicio o mixto." />
            <ThHint label="Rubro" hint="Sector o giro del proveedor." />
            <ThHint
              label="Clasificación"
              hint="Nivel de desempeño según evaluaciones: A (mejor), B (medio), C (bajo)."
            />
            <ThHint
              label="Estado"
              hint="Paso actual: activo, en evaluación, aprobado, rechazado, etc."
            />
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtrados" :key="p.id">
            <td>{{ p.ruc }}</td>
            <td>{{ p.razonSocial }}</td>
            <td>{{ p.tipoProveedor }}</td>
            <td>{{ p.rubro }}</td>
            <td><StatusBadge :status="p.clasificacion" /></td>
            <td><StatusBadge :status="p.estado" /></td>
            <td>
              <RouterLink class="link-action" :to="{ name: 'detalle-proveedor', params: { id: p.id } }">Ver detalle</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!loading && !filtrados.length" class="empty-state">No se encontraron proveedores.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'

const proveedores = ref([])
const loading = ref(true)
const busqueda = ref('')
const filtroEstado = ref('')
const estados = ['Activo', 'Aprobado', 'En evaluación', 'En revisión', 'Rechazado']

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  return proveedores.value.filter((p) => {
    const matchQ = !q || [p.ruc, p.razonSocial, p.rubro].some((v) => v.toLowerCase().includes(q))
    const matchE = !filtroEstado.value || p.estado === filtroEstado.value
    return matchQ && matchE
  })
})

onMounted(async () => {
  proveedores.value = await api.proveedores.listar()
  loading.value = false
})
</script>

