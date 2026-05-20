<template>
  <div>
    <h2 class="page-title">Configuración</h2>
    <p class="page-subtitle">Parámetros generales del sistema de evaluación</p>

    <form v-if="config" class="card form-grid two" @submit.prevent="guardar">
      <div>
        <label>Umbral aprobación (puntaje 0-5)</label>
        <input v-model.number="config.umbralAprobacion" type="number" step="0.1" min="0" max="5" />
      </div>
      <div>
        <label>Umbral observado (puntaje 0-5)</label>
        <input v-model.number="config.umbralObservado" type="number" step="0.1" min="0" max="5" />
      </div>
      <div>
        <label>Días alerta antes de vencimiento</label>
        <input v-model.number="config.diasAlertaVencimiento" type="number" min="1" />
      </div>
      <div>
        <label>Integración ERP</label>
        <input v-model="config.integracionErp" />
      </div>
      <div class="full checkbox-row">
        <label>
          <input v-model="config.notificacionesEmail" type="checkbox" />
          Enviar notificaciones por correo
        </label>
      </div>
      <p v-if="mensaje" class="success-text full">{{ mensaje }}</p>
      <div class="actions full">
        <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Guardando...' : 'Guardar configuración' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'

const config = ref(null)
const loading = ref(false)
const mensaje = ref('')

onMounted(async () => {
  config.value = await api.configuracion.obtener()
})

async function guardar() {
  loading.value = true
  mensaje.value = ''
  try {
    config.value = await api.configuracion.guardar({ ...config.value })
    mensaje.value = 'Configuración guardada (mock).'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.full { grid-column: 1 / -1; }
.checkbox-row label { display: flex; align-items: center; gap: 8px; }
.actions { display: flex; justify-content: flex-end; }
</style>
