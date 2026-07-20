import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_GROUPS, MODULOS, hasAccess } from '@/security/permissions'

const routes = [
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { title: 'Inicio de sesión' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },

      // Dashboard
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: 'Dashboard', roles: ROLE_GROUPS.evaluaciones, modulo: MODULOS.evaluaciones },
      },

      // Proveedores
      {
        path: 'proveedores',
        name: 'proveedores',
        component: () => import('@/views/proveedores/ListadoProveedoresView.vue'),
        meta: { title: 'Proveedores', roles: ROLE_GROUPS.proveedores, modulo: MODULOS.proveedores },
      },
      {
        path: 'registro-proveedor',
        name: 'registro-proveedor',
        component: () => import('@/views/RegistroProveedorView.vue'),
        meta: { title: 'Registro de proveedor', roles: ROLE_GROUPS.proveedores, modulo: MODULOS.proveedores },
      },
      {
        path: 'proveedores/:id',
        name: 'detalle-proveedor',
        component: () => import('@/views/proveedores/DetalleProveedorView.vue'),
        meta: {
          title: 'Detalle del proveedor',
          roles: ROLE_GROUPS.proveedores,
          modulo: MODULOS.proveedores,
          modulosAny: [MODULOS.proveedores, MODULOS.reportes, MODULOS.evaluaciones],
        },
      },
      {
        path: 'proveedores/:id/editar',
        name: 'editar-proveedor',
        component: () => import('@/views/proveedores/EditarProveedorView.vue'),
        meta: { title: 'Actualizar proveedor', roles: ROLE_GROUPS.proveedores, modulo: MODULOS.proveedores },
      },

      // Evaluaciones
      {
        path: 'evaluaciones',
        name: 'evaluaciones-pendientes',
        component: () => import('@/views/evaluaciones/EvaluacionesPendientesView.vue'),
        meta: { title: 'Evaluaciones', roles: ROLE_GROUPS.evaluaciones, modulo: MODULOS.evaluaciones },
      },
      {
        path: 'nueva-evaluacion',
        name: 'nueva-evaluacion',
        component: () => import('@/views/NuevaEvaluacionView.vue'),
        meta: { title: 'Nueva evaluación', roles: ROLE_GROUPS.evaluaciones, modulo: MODULOS.evaluaciones },
      },
      {
        path: 'consolidacion',
        name: 'consolidacion',
        component: () => import('@/views/ConsolidacionEvaluacionView.vue'),
        meta: { title: 'Consolidación de evaluación', roles: ROLE_GROUPS.evaluaciones, modulo: MODULOS.evaluaciones },
      },

      // Reportes
      {
        path: 'ranking',
        redirect: { name: 'reporte-proveedores' },
      },
      {
        path: 'bitacora',
        name: 'bitacora',
        component: () => import('@/views/reportes/HistorialEvaluacionesView.vue'),
        meta: { title: 'Bitácora del sistema', roles: ROLE_GROUPS.administracion, modulo: MODULOS.bitacora },
      },
      {
        path: 'reportes',
        redirect: { name: 'reporte-evaluaciones' },
      },
      {
        path: 'reportes/evaluaciones',
        name: 'reporte-evaluaciones',
        component: () => import('@/views/reportes/ReporteEvaluacionesView.vue'),
        meta: { title: 'Reporte de evaluaciones', roles: ROLE_GROUPS.reportes, modulo: MODULOS.reportes },
      },
      {
        path: 'reportes/proveedores',
        name: 'reporte-proveedores',
        component: () => import('@/views/reportes/ReporteProveedoresView.vue'),
        meta: { title: 'Reporte de proveedores', roles: ROLE_GROUPS.reportes, modulo: MODULOS.reportes },
      },
      {
        path: 'reportes/desempeno',
        name: 'reporte-desempeno',
        component: () => import('@/views/reportes/ReporteDesempenoView.vue'),
        meta: { title: 'Reporte de desempeño', roles: ROLE_GROUPS.reportes, modulo: MODULOS.reportes },
      },

      // Catálogos
      {
        path: 'criterios',
        name: 'criterios',
        component: () => import('@/views/catalogos/CriteriosView.vue'),
        meta: { title: 'Criterios', roles: ROLE_GROUPS.catalogos, modulo: MODULOS.criterios },
      },
      {
        path: 'unidades',
        name: 'unidades',
        component: () => import('@/views/catalogos/UnidadesView.vue'),
        meta: { title: 'Unidades de medida', roles: ROLE_GROUPS.catalogos, modulo: MODULOS.unidades },
      },
      {
        path: 'productos',
        name: 'productos',
        component: () => import('@/views/catalogos/ProductosView.vue'),
        meta: { title: 'Productos / Materiales', roles: ROLE_GROUPS.catalogos, modulo: MODULOS.productos },
      },
      {
        path: 'documentos',
        name: 'documentos',
        component: () => import('@/views/catalogos/DocumentosView.vue'),
        meta: { title: 'Documentos', roles: ROLE_GROUPS.documentos, modulo: MODULOS.documentos },
      },

      // Seguridad
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('@/views/seguridad/UsuariosView.vue'),
        meta: { title: 'Usuarios', roles: ROLE_GROUPS.administracion, modulo: MODULOS.usuarios },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/views/seguridad/RolesView.vue'),
        meta: { title: 'Roles', roles: ROLE_GROUPS.administracion, modulo: MODULOS.roles },
      },

      // Configuración
      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('@/views/ConfiguracionView.vue'),
        meta: { title: 'Configuración', roles: ROLE_GROUPS.administracion, modulo: MODULOS.configuracion },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const TOKEN_KEY = 'filasur_token'
const USER_KEY = 'filasur_user'

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const isPublic = to.matched.some((r) => r.meta.public)

  if (!token && !isPublic) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (token && to.name === 'login') {
    next({ name: 'dashboard' })
    return
  }

  if (token) {
    const auth = useAuthStore()
    if (!auth.token) auth.hydrateFromStorage()
    const restricted = to.matched.find((r) => Array.isArray(r.meta.roles) || r.meta.modulo || r.meta.modulosAny)
    if (
      restricted &&
      !hasAccess(auth.user, {
        roles: restricted.meta.roles || [],
        modulo: restricted.meta.modulo,
        modulosAny: restricted.meta.modulosAny,
      })
    ) {
      next({ name: 'dashboard' })
      return
    }
  }

  next()
})

export { TOKEN_KEY, USER_KEY }
export default router
