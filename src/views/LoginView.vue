<template>
  <div class="login-card card">
    <div class="login-brand">
      <img src="/favicon.svg" alt="FILASUR" class="logo-img">
      <div>
        <h2>FILASUR S.A.</h2>
        <p>Evaluación de proveedores</p>
      </div>
    </div>
    <form class="form-grid" @submit.prevent="onSubmit">
      <div>
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="email" type="email" required autocomplete="username" />
      </div>
      <div>
        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
      </div>
      <p class="forgot">
        <a href="#" @click.prevent="recuperar">¿Olvidaste tu contraseña?</a>
      </p>
      <p v-if="auth.error" class="error-text">{{ auth.error }}</p>
      <p v-if="info" class="info-text">{{ info }}</p>
      <button class="btn btn-primary" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Ingresando...' : 'Iniciar sesión' }}
      </button>
      <p class="hint">Modo mock activo: use las credenciales del archivo .env</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toastInfo } from '@/utils/alerts'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref(import.meta.env.VITE_MOCK_USER || '')
const password = ref('')
const info = ref('')

function recuperar() {
  info.value = ''
  toastInfo('Recuperación básica: contacte al administrador o use las credenciales del archivo .env.')
}

async function onSubmit() {
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.push(redirect)
  } catch {
    /* error en store */
  }
}
</script>

<style scoped>
.login-card {
  width: min(420px, 100%);
  padding: 32px;
}

.login-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}

.logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--filasur-sidebar);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 20px;
}

.login-brand h2 {
  margin: 0;
}

.login-brand p {
  margin: 4px 0 0;
  color: var(--filasur-muted);
}

.hint {
  font-size: 12px;
  color: var(--filasur-muted);
  margin: 0;
}

.forgot {
  margin: 0;
  text-align: right;
  font-size: 13px;
}

.forgot a {
  color: var(--filasur-primary);
}

.info-text {
  color: var(--filasur-primary);
  font-size: 13px;
  margin: 0;
}
</style>