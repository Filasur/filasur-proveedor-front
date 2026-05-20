import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useEvaluacionStore = defineStore('evaluacion', () => {
  const borrador = ref({
    proveedorId: '',
    periodo: '',
    criterios: [],
    observaciones: '',
  })
  const consolidacion = ref(null)
  const loading = ref(false)

  async function cargarConsolidacion(id) {
    loading.value = true
    try {
      consolidacion.value = await api.evaluaciones.consolidacion(id)
    } finally {
      loading.value = false
    }
  }

  async function guardarBorrador(payload) {
    borrador.value = { ...borrador.value, ...payload }
    return api.evaluaciones.guardarBorrador(borrador.value)
  }

  function resetBorrador() {
    borrador.value = {
      proveedorId: '',
      periodo: '',
      criterios: [],
      observaciones: '',
    }
  }

  return { borrador, consolidacion, loading, cargarConsolidacion, guardarBorrador, resetBorrador }
})