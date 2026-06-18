<template>
  <header class="header">
    <div>
      <h1 class="header-title">{{ title }}</h1>
      <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
    </div>
    <div class="header-actions">
      <span class="user">{{ userLabel }}</span>
      <button type="button" class="btn btn-sesion" title="Salir del sistema" @click="onLogout">
        Cerrar sesión
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  subtitle: { type: String, default: '' },
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const title = computed(() => route.meta.title || 'FILASUR')
const userLabel = computed(() => auth.user?.nombre || auth.user?.email || 'Usuario')

function onLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--filasur-card);
  border-bottom: 1px solid var(--filasur-border);
}

.header-title {
  margin: 0;
  font-size: 20px;
}

.header-subtitle {
  margin: 4px 0 0;
  color: var(--filasur-muted);
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user {
  color: var(--filasur-text);
  font-size: 14px;
  font-weight: 500;
  padding-right: 12px;
  border-right: 1px solid var(--filasur-border);
}
</style>