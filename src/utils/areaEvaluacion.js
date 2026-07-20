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

/** Orden obligatorio de evaluación por rol (por partes). */
export const ORDEN_FASES = [ROLES.calidad, ROLES.compras, ROLES.logistica]

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

/** Solo Calidad (o Admin) puede iniciar una evaluación nueva. */
export function puedeIniciarEvaluacion(rolUsuario) {
  return rolUsuario === ROLES.admin || rolUsuario === ROLES.calidad
}

function puntajePresente(v) {
  if (v === null || v === undefined || v === '') return false
  const n = Number(v)
  return !Number.isNaN(n)
}

export function criteriosDeFase(criterios, rolFase) {
  return (criterios || []).filter((c) => rolParaArea(c.area) === rolFase)
}

export function faseCompleta(criterios, puntajes, rolFase) {
  const lista = criteriosDeFase(criterios, rolFase)
  if (!lista.length) return true
  return lista.every((c) => puntajePresente(puntajes?.[c.id] ?? puntajes?.[String(c.id)]))
}

/** Rol cuyo turno es ahora, o null si todas las fases están completas. */
export function faseActual(criterios, puntajes) {
  for (const fase of ORDEN_FASES) {
    if (!faseCompleta(criterios, puntajes, fase)) return fase
  }
  return null
}

/** Índice 0..n de la fase actual (para UI). Si todo completo, ORDEN_FASES.length. */
export function indiceFaseActual(criterios, puntajes) {
  const actual = faseActual(criterios, puntajes)
  if (!actual) return ORDEN_FASES.length
  return ORDEN_FASES.indexOf(actual)
}

export function esTurnoDelRol(rolUsuario, criterios, puntajes) {
  if (!rolUsuario) return false
  if (rolUsuario === ROLES.admin) return true
  const actual = faseActual(criterios, puntajes)
  if (!actual) return false
  return rolUsuario === actual
}

export function mensajeEsperaTurno(rolUsuario, criterios, puntajes) {
  const actual = faseActual(criterios, puntajes)
  if (!actual) {
    return 'La evaluación ya tiene todos los puntajes. Puede revisarla en consolidación.'
  }
  if (rolUsuario === actual) return ''

  const idxUser = ORDEN_FASES.indexOf(rolUsuario)
  const idxActual = ORDEN_FASES.indexOf(actual)
  if (idxUser >= 0 && idxActual > idxUser) {
    return `Su fase («${rolUsuario}») ya fue enviada. Turno actual: «${actual}».`
  }
  return `Aún no es su turno. Debe completar primero la fase de «${actual}» (orden: Calidad → Compras → Logística).`
}

export const RESUMEN_MAPEO_AREAS = [
  { area: 'Calidad', rol: ROLES.calidad },
  { area: 'Logística', rol: ROLES.logistica },
  { area: 'Comercial', rol: ROLES.compras },
  { area: 'Costos', rol: ROLES.compras },
]
