import { ROLES } from '@/security/permissions'

/**
 * Área de negocio del criterio → rol del sistema que debe calificar.
 * Comercial y Costos los cubre Compras (no hay roles homónimos en el sistema).
 */
export const AREA_A_ROL = {
  Calidad: ROLES.calidad,
  Logística: ROLES.logistica,
  Logistica: ROLES.logistica,
  Comercial: ROLES.compras,
  Costos: ROLES.compras,
  Compras: ROLES.compras,
}

/** Roles que pueden aprobar o rechazar en consolidación */
export const ROLES_APROBACION = [ROLES.admin, ROLES.compras]

export function rolParaArea(area) {
  if (!area) return '—'
  const key = String(area).trim()
  return AREA_A_ROL[key] ?? key
}

export function etiquetaCalificador(area) {
  const rol = rolParaArea(area)
  if (rol === area || !area) return `Califica: ${rol}`
  return `Califica: ${rol} (área ${area})`
}

export function puedeCalificarArea(rolUsuario, area) {
  if (!rolUsuario) return false
  if (rolUsuario === ROLES.admin) return true
  return rolUsuario === rolParaArea(area)
}

export function puedeAprobarEvaluacion(rolUsuario) {
  return ROLES_APROBACION.includes(rolUsuario)
}

export const RESUMEN_MAPEO_AREAS = [
  { area: 'Calidad', rol: ROLES.calidad },
  { area: 'Logística', rol: ROLES.logistica },
  { area: 'Comercial', rol: ROLES.compras },
  { area: 'Costos', rol: ROLES.compras },
]
