export const ROLES = {
  admin: 'Administrador',
  compras: 'Compras',
  calidad: 'Calidad',
  logistica: 'Logística',
}

/**
 * Acceso base por rol (fallback si el login no trae módulos).
 * Con RolModulo configurado, manda lo de la BD / JWT.
 */
export const ROLE_GROUPS = {
  administracion: [ROLES.admin],
  proveedores: [ROLES.admin, ROLES.compras, ROLES.logistica],
  evaluaciones: [ROLES.admin, ROLES.compras, ROLES.calidad, ROLES.logistica],
  reportes: [ROLES.admin, ROLES.compras, ROLES.logistica],
  catalogos: [ROLES.admin, ROLES.compras],
  documentos: [ROLES.admin, ROLES.compras, ROLES.logistica],
}

/** Módulos de RolModulo (BD) → rutas del menú / API */
export const MODULOS = {
  todos: 'Todos',
  proveedores: 'Proveedores',
  evaluaciones: 'Evaluaciones',
  reportes: 'Reportes',
  documentos: 'Documentos',
  criterios: 'Criterios',
  unidades: 'Unidades',
  productos: 'Productos',
  usuarios: 'Usuarios',
  roles: 'Roles',
  configuracion: 'Configuración',
  bitacora: 'Bitácora',
}

export function hasRole(user, roles = []) {
  if (!roles.length) return true
  return roles.includes(user?.rol)
}

/**
 * Acceso alineado con el API (claims JWT «modulo»).
 * - «Todos» abre todo.
 * - Si el usuario trae módulos de RolModulo, esos mandan (igual que el back).
 * - `modulosAny`: basta con tener uno de la lista (p. ej. detalle desde Reportes).
 * - Sin módulos en sesión, cae al filtro por rol (compatibilidad).
 */
export function hasAccess(user, { roles = [], modulo, modulosAny } = {}) {
  const mods = Array.isArray(user?.modulos) ? user.modulos : []
  if (mods.includes(MODULOS.todos)) return true

  const required =
    Array.isArray(modulosAny) && modulosAny.length
      ? modulosAny
      : modulo
        ? [modulo]
        : []

  if (mods.length > 0) {
    if (!required.length) return hasRole(user, roles)
    return required.some((m) => mods.includes(m))
  }

  return hasRole(user, roles)
}
