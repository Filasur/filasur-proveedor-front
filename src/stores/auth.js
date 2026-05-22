import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { TOKEN_KEY, USER_KEY } from '@/router'
import { toastSuccess } from '@/utils/alerts'

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw || raw === 'undefined' || raw === 'null') return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(readStoredUser())
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(token.value))

  function persistSession(session) {
    if (!session?.token) {
      clearStoredSession()
      token.value = ''
      user.value = null
      return
    }
    token.value = session.token
    user.value = session.user ?? null
    localStorage.setItem(TOKEN_KEY, session.token)
    if (session.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(session.user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  function hydrateFromStorage() {
    token.value = localStorage.getItem(TOKEN_KEY) || ''
    user.value = readStoredUser()
    if (token.value && !user.value) {
      const raw = localStorage.getItem(USER_KEY)
      if (raw === 'undefined' || !raw) clearStoredSession()
      token.value = ''
    }
  }

  async function login(email, password) {
    loading.value = true
    error.value = ''
    try {
      const session = await api.auth.login({ email, password })
      persistSession(session)
      toastSuccess(`Bienvenido, ${session.user?.nombre || 'usuario'}`)
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
    clearStoredSession()
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