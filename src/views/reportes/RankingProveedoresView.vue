<template>
  <div>
    <h2 class="page-title">Ranking de proveedores</h2>
    <p class="page-subtitle">Clasificación automática según puntaje de evaluaciones</p>

    <div class="card toolbar-row">
      <div class="field">
        <label>Clasificación</label>
        <select v-model="filtroClase">
          <option value="">Todas (A / B / C)</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Proveedor</th>
            <th>Puntaje promedio</th>
            <th>Clasificación</th>
            <th>Evaluaciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtrados" :key="r.posicion">
            <td><strong>{{ r.posicion }}</strong></td>
            <td>{{ r.proveedor }}</td>
            <td>{{ r.puntaje.toFixed(2) }} / 5.00</td>
            <td><StatusBadge :status="r.clasificacion" /></td>
            <td>{{ r.evaluaciones }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const ranking = ref([])
const filtroClase = ref('')

const filtrados = computed(() =>
  filtroClase.value ? ranking.value.filter((r) => r.clasificacion === filtroClase.value) : ranking.value
)

onMounted(async () => {
  ranking.value = await api.ranking.listar()
})
</script>
