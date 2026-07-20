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

  let res
  try {
    res = await fetch(`${baseUrl}${path}`, { ...options, headers })
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. Si estaba subiendo un documento, confirme el deploy del API y el script 08_documentos_gestion.sql en la BD remota.'
    )
  }
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

const MAX_DOC_BYTES = 10 * 1024 * 1024

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error(`No se pudo leer el archivo ${file.name}`))
    reader.readAsDataURL(file)
  })
}

async function archivosABase64(archivos) {
  const items = []
  for (const file of archivos) {
    if (file.size > MAX_DOC_BYTES) {
      throw new Error(`El archivo "${file.name}" supera el máximo de 10 MB.`)
    }
    items.push({
      nombreArchivo: file.name,
      contenidoBase64: await fileToBase64(file),
    })
  }
  return items
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
    subirDocumentos: async (idProveedor, archivos, meta = {}) => {
      const items = await archivosABase64(archivos)
      return request(`/proveedores/${idProveedor}/documentos`, {
        method: 'POST',
        body: JSON.stringify({
          archivos: items,
          categoria: meta.categoria || null,
          fechaVencimiento: meta.fechaVencimiento || null,
        }),
      })
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
    listar: () => request('/bitacora?top=300'),
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
