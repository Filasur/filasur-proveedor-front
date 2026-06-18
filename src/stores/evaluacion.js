import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useEvaluacionStore = defineStore('evaluacion', () => {
  const borrador = ref({
    id: null,
    proveedorId: '',
    periodo: '',
    idProducto: '',
    ordenCompra: '',
    criterios: [],
    observaciones: '',
  })
  const consolidacion = ref(null)
  const loading = ref(false)

  async function cargarConsolidacion(id) {
    const idEvaluacion = Number(id)
    if (!Number.isInteger(idEvaluacion) || idEvaluacion <= 0) {
      throw new Error('ID de evaluación inválido.')
    }
    loading.value = true
    try {
      consolidacion.value = await api.evaluaciones.consolidacion(idEvaluacion)
    } finally {
      loading.value = false
    }
  }

  async function guardarBorrador(payload) {
    borrador.value = { ...borrador.value, ...payload }
    const puntajes = payload.puntajes ?? {}
    const puntajesApi = Object.fromEntries(
      Object.entries(puntajes)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => [String(k), Number(v)]),
    )
    const body = {
      id: payload.id ? Number(payload.id) : null,
      proveedorId: Number(payload.proveedorId),
      periodo: payload.periodo?.trim() ?? '',
      idProducto: payload.idProducto ? Number(payload.idProducto) : null,
      ordenCompra: payload.ordenCompra?.trim() || null,
      observaciones: payload.observaciones?.trim() || null,
      puntajes: puntajesApi,
      finalizar: Boolean(payload.finalizar),
    }
    return api.evaluaciones.guardarBorrador(body)
  }

  function resetBorrador() {
    borrador.value = {
      id: null,
      proveedorId: '',
      periodo: '',
      idProducto: '',
      ordenCompra: '',
      criterios: [],
      observaciones: '',
    }
  }

  return { borrador, consolidacion, loading, cargarConsolidacion, guardarBorrador, resetBorrador }
})