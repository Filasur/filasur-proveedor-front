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
  documentos: [ROLES.admin, ROLES.logistica],
}

export function hasRole(user, roles = []) {
  if (!roles.length) return true
  return roles.includes(user?.rol)
}
