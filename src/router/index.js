import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
        meta: { title: 'Dashboard' },
      },

      // Proveedores
      {
        path: 'proveedores',
        name: 'proveedores',
        component: () => import('@/views/proveedores/ListadoProveedoresView.vue'),
        meta: { title: 'Proveedores' },
      },
      {
        path: 'registro-proveedor',
        name: 'registro-proveedor',
        component: () => import('@/views/RegistroProveedorView.vue'),
        meta: { title: 'Registro de proveedor' },
      },
      {
        path: 'proveedores/:id',
        name: 'detalle-proveedor',
        component: () => import('@/views/proveedores/DetalleProveedorView.vue'),
        meta: { title: 'Detalle del proveedor' },
      },
      {
        path: 'proveedores/:id/editar',
        name: 'editar-proveedor',
        component: () => import('@/views/proveedores/EditarProveedorView.vue'),
        meta: { title: 'Actualizar proveedor' },
      },

      // Evaluaciones
      {
        path: 'evaluaciones',
        name: 'evaluaciones-pendientes',
        component: () => import('@/views/evaluaciones/EvaluacionesPendientesView.vue'),
        meta: { title: 'Evaluaciones' },
      },
      {
        path: 'nueva-evaluacion',
        name: 'nueva-evaluacion',
        component: () => import('@/views/NuevaEvaluacionView.vue'),
        meta: { title: 'Nueva evaluación' },
      },
      {
        path: 'consolidacion',
        name: 'consolidacion',
        component: () => import('@/views/ConsolidacionEvaluacionView.vue'),
        meta: { title: 'Consolidación de evaluación' },
      },

      // Ranking y reportes
      {
        path: 'ranking',
        name: 'ranking',
        component: () => import('@/views/reportes/RankingProveedoresView.vue'),
        meta: { title: 'Ranking de proveedores' },
      },
      {
        path: 'historial',
        name: 'historial',
        component: () => import('@/views/reportes/HistorialEvaluacionesView.vue'),
        meta: { title: 'Historial' },
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('@/views/reportes/ReportesView.vue'),
        meta: { title: 'Reportes' },
      },

      // Catálogos
      {
        path: 'criterios',
        name: 'criterios',
        component: () => import('@/views/catalogos/CriteriosView.vue'),
        meta: { title: 'Criterios' },
      },
      {
        path: 'productos',
        name: 'productos',
        component: () => import('@/views/catalogos/ProductosView.vue'),
        meta: { title: 'Productos / Materiales' },
      },
      {
        path: 'documentos',
        name: 'documentos',
        component: () => import('@/views/catalogos/DocumentosView.vue'),
        meta: { title: 'Documentos' },
      },

      // Seguridad
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('@/views/seguridad/UsuariosView.vue'),
        meta: { title: 'Usuarios' },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/views/seguridad/RolesView.vue'),
        meta: { title: 'Roles' },
      },

      // Configuración
      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('@/views/ConfiguracionView.vue'),
        meta: { title: 'Configuración' },
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
  }

  next()
})

export { TOKEN_KEY, USER_KEY }
export default router
