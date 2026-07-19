import { normalizeDashboardResponse } from '@/utils/normalizeDashboard'

const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')

/** Respuesta estándar del back: { success, message, data } */
function unwrapApiPayload(body) {
  if (body == null || typeof body !== 'object') return body
  if (Object.prototype.hasOwnProperty.call(body, 'data')) {
    if (body.success === false) {
      throw new Error(body.message || 'Error en la operación')
    }
    return body.data
  }
  return body
}

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }
  const token = localStorage.getItem('filasur_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers })
  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      body?.message ||
      (typeof body?.data === 'string' ? body.data : null) ||
      `Error HTTP ${res.status}`
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return unwrapApiPayload(body)
}

async function requestForm(path, formData, method = 'POST') {
  const headers = {}
  const token = localStorage.getItem('filasur_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${baseUrl}${path}`, { method, headers, body: formData })
  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      body?.message ||
      (typeof body?.data === 'string' ? body.data : null) ||
      `Error HTTP ${res.status}`
    throw new Error(msg)
  }
  return unwrapApiPayload(body)
}

const realApi = {
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    recuperarPassword: (body) =>
      request('/auth/recuperar-password', { method: 'POST', body: JSON.stringify(body) }),
    cambiarPassword: (body) =>
      request('/auth/cambiar-password', { method: 'POST', body: JSON.stringify(body) }),
  },
  dashboard: {
    getResumen: async () => normalizeDashboardResponse(await request('/dashboard/resumen')),
  },
  proveedores: {
    listar: () => request('/proveedores'),
    obtener: (id) => request(`/proveedores/${id}`),
    registrar: (body) => request('/proveedores', { method: 'POST', body: JSON.stringify(body) }),
    actualizar: (id, body) => request(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    subirDocumentos: (idProveedor, archivos, meta = {}) => {
      const form = new FormData()
      for (const file of archivos) {
        form.append('archivos', file)
      }
      if (meta.categoria) form.append('categoria', meta.categoria)
      if (meta.fechaVencimiento) form.append('fechaVencimiento', meta.fechaVencimiento)
      return requestForm(`/proveedores/${idProveedor}/documentos`, form)
    },
  },
  evaluaciones: {
    listar: (params) => request(`/evaluaciones?${new URLSearchParams(params || {})}`),
    listarCriterios: () => request('/evaluaciones/criterios'),
    obtenerBorrador: (id) => request(`/evaluaciones/${Number(id)}/borrador`),
    guardarBorrador: (body) => request('/evaluaciones/borrador', { method: 'POST', body: JSON.stringify(body) }),
    consolidacion: (id) => request(`/evaluaciones/${Number(id)}/consolidacion`),
    aprobar: (id) => request(`/evaluaciones/${Number(id)}/aprobar`, { method: 'POST' }),
    rechazar: (id, motivo) =>
      request(`/evaluaciones/${Number(id)}/rechazar`, {
        method: 'POST',
        body: JSON.stringify({ motivo: motivo ?? null }),
      }),
  },
  ranking: {
    listar: () => request('/ranking'),
  },
  bitacora: {
    listar: () => request('/bitacora'),
  },
  reportes: {
    listar: (params) => request(`/reportes?${new URLSearchParams(params || {})}`),
  },
  criterios: {
    listar: () => request('/criterios'),
    guardar: (body) => request('/criterios', { method: 'PUT', body: JSON.stringify(body) }),
  },
  unidades: {
    listar: () => request('/unidades'),
    crear: (body) => request('/unidades', { method: 'POST', body: JSON.stringify(body) }),
    actualizar: (id, body) =>
      request(`/unidades/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    guardar: (body) => request('/unidades', { method: 'PUT', body: JSON.stringify(body) }),
  },
  productos: {
    listar: () => request('/productos'),
    crear: (body) => request('/productos', { method: 'POST', body: JSON.stringify(body) }),
    actualizar: (id, body) =>
      request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  },
  documentos: {
    listar: (params) => request(`/documentos?${new URLSearchParams(params || {})}`),
    categorias: () => request('/documentos/categorias'),
    eliminar: (id) => request(`/documentos/${id}`, { method: 'DELETE' }),
  },
  usuarios: {
    listar: () => request('/usuarios'),
    crear: (body) => request('/usuarios', { method: 'POST', body: JSON.stringify(body) }),
    actualizar: (id, body) =>
      request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    desbloquear: (id) => request(`/usuarios/${id}/desbloquear`, { method: 'POST' }),
  },
  roles: {
    listar: () => request('/roles'),
    actualizarModulos: (id, modulos) =>
      request(`/roles/${id}/modulos`, { method: 'PUT', body: JSON.stringify({ modulos }) }),
  },
  configuracion: {
    obtener: () => request('/configuracion'),
    guardar: (body) => request('/configuracion', { method: 'PUT', body: JSON.stringify(body) }),
  },
}

export default realApi
