export const ROLES = {
  admin: 'Administrador',
  compras: 'Compras',
  calidad: 'Calidad',
  logistica: 'Logística',
}

export const ROLE_GROUPS = {
  administracion: [ROLES.admin],
  proveedores: [ROLES.admin, ROLES.compras, ROLES.logistica],
  evaluaciones: [ROLES.admin, ROLES.compras, ROLES.calidad, ROLES.logistica],
  reportes: [ROLES.admin, ROLES.compras],
  catalogos: [ROLES.admin, ROLES.compras],
  documentos: [ROLES.admin, ROLES.compras, ROLES.logistica],
}

/** Módulos de RolModulo (BD) → rutas del menú */
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
 * Acceso por módulo de RolModulo (si el usuario trae modulos desde login).
 * Si no hay modulos cargados, cae al filtro por rol (compatibilidad).
 */
export function hasAccess(user, { roles = [], modulo } = {}) {
  const mods = Array.isArray(user?.modulos) ? user.modulos : []
  if (mods.length) {
    if (mods.includes(MODULOS.todos)) return true
    if (modulo) return mods.includes(modulo)
  }
  return hasRole(user, roles)
}
