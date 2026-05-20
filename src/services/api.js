import { mockApi } from '@/mocks'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'
const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const token = localStorage.getItem('filasur_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Error HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

const realApi = {
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  dashboard: {
    getResumen: () => request('/dashboard/resumen'),
  },
  proveedores: {
    listar: () => request('/proveedores'),
    obtener: (id) => request(`/proveedores/${id}`),
    registrar: (body) => request('/proveedores', { method: 'POST', body: JSON.stringify(body) }),
    actualizar: (id, body) => request(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  },
  evaluaciones: {
    listar: (params) => request(`/evaluaciones?${new URLSearchParams(params || {})}`),
    listarCriterios: () => request('/evaluaciones/criterios'),
    guardarBorrador: (body) => request('/evaluaciones/borrador', { method: 'POST', body: JSON.stringify(body) }),
    consolidacion: (id) => request(`/evaluaciones/${id}/consolidacion`),
    aprobar: (id) => request(`/evaluaciones/${id}/aprobar`, { method: 'POST' }),
    rechazar: (id) => request(`/evaluaciones/${id}/rechazar`, { method: 'POST' }),
  },
  ranking: {
    listar: () => request('/ranking'),
  },
  historial: {
    listar: () => request('/historial'),
  },
  reportes: {
    listar: (params) => request(`/reportes?${new URLSearchParams(params || {})}`),
  },
  criterios: {
    listar: () => request('/criterios'),
  },
  productos: {
    listar: () => request('/productos'),
  },
  documentos: {
    listar: () => request('/documentos'),
  },
  usuarios: {
    listar: () => request('/usuarios'),
    crear: (body) => request('/usuarios', { method: 'POST', body: JSON.stringify(body) }),
  },
  roles: {
    listar: () => request('/roles'),
  },
  configuracion: {
    obtener: () => request('/configuracion'),
    guardar: (body) => request('/configuracion', { method: 'PUT', body: JSON.stringify(body) }),
  },
}

const api = useMock ? mockApi : realApi

export default api
