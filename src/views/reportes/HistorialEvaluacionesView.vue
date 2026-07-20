<template>
  <div>
    <h2 class="page-title">Bitácora del sistema</h2>
    <p class="page-subtitle">
      Acciones de la aplicación y auditoría de cambios en base de datos (triggers bit_*)
    </p>

    <div class="card toolbar-row">
      <div class="field grow">
        <LabelHint label="Buscar" hint="Filtra por acción, detalle o nombre de usuario." />
        <input v-model="busqueda" placeholder="Acción, detalle o usuario..." />
      </div>
      <div class="field">
        <LabelHint label="Módulo" hint="Área del sistema o tabla de auditoría." />
        <select v-model="filtroModulo">
          <option value="">Todos</option>
          <option v-for="m in modulosDisponibles" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Fecha" hint="Momento en que se registró el evento." />
            <ThHint label="Usuario" hint="Persona o login SQL que realizó la acción." />
            <ThHint label="Módulo" hint="Sección del sistema o auditoría de tabla." />
            <ThHint label="Acción" hint="Tipo de operación." />
            <ThHint label="Detalle" hint="Descripción adicional del registro." />
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in filtrados" :key="h.id">
            <td>{{ h.fecha }}</td>
            <td>{{ h.usuario }}</td>
            <td>{{ h.modulo }}</td>
            <td>{{ h.accion }}</td>
            <td class="detalle-cell">{{ h.detalle }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtrados.length" class="empty-state">Sin resultados.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'

const MODULOS_BASE = [
  'Autenticación',
  'Documentos',
  'Evaluaciones',
  'Proveedores',
  'Auditoría Usuario',
  'Auditoría Proveedor',
  'Auditoría Producto',
  'Auditoría Evaluación',
  'Auditoría Rol',
]

const historial = ref([])
const busqueda = ref('')
const filtroModulo = ref('')

const modulosDisponibles = computed(() => {
  const desdeData = historial.value.map((h) => h.modulo).filter(Boolean)
  return [...new Set([...MODULOS_BASE, ...desdeData])].sort((a, b) => a.localeCompare(b, 'es'))
})

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return historial.value.filter((h) => {
    const matchM = !filtroModulo.value || h.modulo === filtroModulo.value
    const matchQ =
      !q ||
      [h.accion, h.detalle, h.usuario, h.modulo].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(q),
      )
    return matchM && matchQ
  })
})

onMounted(async () => {
  historial.value = await api.bitacora.listar()
})
</script>

<style scoped>
.detalle-cell {
  max-width: 420px;
  word-break: break-word;
  font-size: 13px;
}
</style>
