export const CATEGORIAS_DOCUMENTO = [
  'Ficha técnica',
  'Certificado',
  'RUC / Constancia',
  'Contrato',
  'Otro',
]

const apiBase = () => (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')

/** URL base del servidor (sin sufijo /api) para archivos estáticos /uploads */
export function getUploadsBaseUrl() {
  const base = apiBase()
  if (!base) return ''
  return base.replace(/\/api\/?$/i, '')
}

/** Enlace directo al archivo en /uploads (sin JWT) */
export function getDocumentoDownloadUrl(ruta) {
  if (!ruta || typeof ruta !== 'string') return null
  const host = getUploadsBaseUrl()
  if (!host) return null
  const path = ruta.replace(/^\/+/, '').replace(/\\/g, '/')
  return `${host}/uploads/${path}`
}

/** Endpoint API con autenticación (recomendado) */
export function getDocumentoApiDownloadUrl(idDocumento) {
  if (idDocumento == null || idDocumento === '') return null
  const base = apiBase()
  if (!base) return null
  return `${base}/documentos/${idDocumento}/descargar`
}

export function puedeDescargarDocumento(doc) {
  return Boolean(doc?.id) || Boolean(doc?.ruta)
}

/** Descarga con token JWT (abre/guarda el archivo en el navegador) */
export async function descargarDocumento(doc) {
  const url = doc?.id ? getDocumentoApiDownloadUrl(doc.id) : getDocumentoDownloadUrl(doc?.ruta)
  if (!url) throw new Error('No hay ruta de descarga para este documento.')

  const headers = {}
  const token = localStorage.getItem('filasur_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('No se pudo descargar el archivo.')

  const blob = await res.blob()
  const nombre =
    doc.nombre ||
    res.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1] ||
    'documento'

  const objectUrl = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = objectUrl
  enlace.download = nombre
  enlace.rel = 'noopener'
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(objectUrl)
}
