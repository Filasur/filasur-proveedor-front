<template>
  <div>
    <div class="page-head">
      <div>
        <h2 class="page-title">Productos / Materiales</h2>
        <p class="page-subtitle">Catálogo de materiales evaluables</p>
      </div>
      <button type="button" class="btn btn-primary" disabled>+ Nuevo material</button>
    </div>

    <div class="card toolbar-row">
      <div class="field grow">
        <label>Buscar</label>
        <input v-model="busqueda" placeholder="Código o nombre..." />
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Unidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtrados" :key="p.id">
            <td>{{ p.codigo }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ p.categoria }}</td>
            <td>{{ p.unidad }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'

const productos = ref([])
const busqueda = ref('')

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return productos.value.filter(
    (p) => !q || p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  productos.value = await api.productos.listar()
})
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; margin-bottom: 8px; }
.page-head .page-subtitle { margin-bottom: 16px; }
</style>
