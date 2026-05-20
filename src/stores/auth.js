import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { TOKEN_KEY, USER_KEY } from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(token.value))

  function persistSession(session) {
    token.value = session.token
    user.value = session.user
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  }

  function hydrateFromStorage() {
    token.value = localStorage.getItem(TOKEN_KEY) || ''
    const raw = localStorage.getItem(USER_KEY)
    user.value = raw ? JSON.parse(raw) : null
  }

  async function login(email, password) {
    loading.value = true
    error.value = ''
    try {
      const session = await api.auth.login({ email, password })
      persistSession(session)
      return session
    } catch (e) {
      error.value = e.message || 'No se pudo iniciar sesión'
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    hydrateFromStorage,
  }
})