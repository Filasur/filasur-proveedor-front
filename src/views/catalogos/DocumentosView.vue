<template>
  <div>
    <h2 class="page-title">Documentos</h2>
    <p class="page-subtitle">Documentación adjunta de proveedores</p>

    <div class="card toolbar-row">
      <div class="field grow">
        <LabelHint
          label="Buscar proveedor o archivo"
          hint="Filtra por razón social del proveedor o nombre del documento."
        />
        <input v-model="busqueda" placeholder="Nombre del archivo o proveedor..." />
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <ThHint label="Proveedor" hint="Empresa dueña del documento." />
            <ThHint label="Archivo" hint="Nombre del archivo adjunto." />
            <ThHint label="Tipo" hint="Formato o categoría (PDF, certificado, etc.)." />
            <ThHint label="Tamaño" hint="Peso del archivo." />
            <ThHint label="Fecha" hint="Fecha de carga o vencimiento." />
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
import LabelHint from '@/components/ui/LabelHint.vue'
import ThHint from '@/components/ui/ThHint.vue'

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
