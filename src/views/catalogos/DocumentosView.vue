<template>
  <div>
    <h2 class="page-title">Documentos</h2>
    <p class="page-subtitle">Documentación adjunta de proveedores</p>

    <div class="card toolbar-row">
      <div class="field grow">
        <label>Buscar proveedor o archivo</label>
        <input v-model="busqueda" placeholder="Nombre del archivo o proveedor..." />
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Archivo</th>
            <th>Tipo</th>
            <th>Tamaño</th>
            <th>Fecha</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in filtrados" :key="d.id">
            <td>{{ d.proveedor }}</td>
            <td>{{ d.nombre }}</td>
            <td>{{ d.tipo }}</td>
            <td>{{ d.tamano }}</td>
            <td>{{ d.fecha }}</td>
            <td><span class="link-action">Descargar</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'

const documentos = ref([])
const busqueda = ref('')

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return documentos.value.filter(
    (d) => !q || d.proveedor.toLowerCase().includes(q) || d.nombre.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  documentos.value = await api.documentos.listar()
})
</script>
