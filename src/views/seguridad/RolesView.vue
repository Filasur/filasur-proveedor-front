<template>
  <div>
    <h2 class="page-title">Gestión de roles</h2>
    <p class="page-subtitle">Permisos y acceso por módulo del sistema</p>

    <div class="roles-grid">
      <article v-for="r in roles" :key="r.id" class="card role-card">
        <h3>{{ r.nombre }}</h3>
        <p>{{ r.descripcion }}</p>
        <div class="modulos">
          <span v-for="m in r.modulos" :key="m" class="mod-tag">{{ m }}</span>
        </div>
        <button type="button" class="btn btn-ghost" disabled>Editar permisos</button>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'

const roles = ref([])
onMounted(async () => {
  roles.value = await api.roles.listar()
})
</script>

<style scoped>
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.role-card h3 { margin: 0 0 8px; }
.role-card p { color: var(--filasur-muted); font-size: 14px; margin: 0 0 12px; }
.modulos { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.mod-tag {
  background: #e6f7ff;
  color: #096dd9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
