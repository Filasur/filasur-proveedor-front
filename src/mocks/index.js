import {
  mockUser,
  mockDashboard,
  mockProveedores,
  mockEvaluaciones,
  mockCriterios,
  mockUnidades,
  mockProductos,
  mockDocumentos,
  mockRanking,
  mockHistorial,
  mockReportes,
  mockUsuarios,
  mockRoles,
  mockConsolidacion,
  mockConfiguracion,
} from './data.js'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

function mockToken() {
  return `mock-${Date.now()}`
}

export const mockApi = {
  auth: {
    async login({ email, password }) {
      await delay()
      const expectedUser = import.meta.env.VITE_MOCK_USER
      const expectedPass = import.meta.env.VITE_MOCK_PASSWORD
      if (email !== expectedUser || password !== expectedPass) {
        throw new Error('Credenciales incorrectas (modo mock)')
      }
      return { token: mockToken(), user: { ...mockUser, email } }
    },
  },
  dashboard: {
    async getResumen() {
      await delay()
      return mockDashboard
    },
  },
  proveedores: {
    async listar() {
      await delay()
      return [...mockProveedores]
    },
    async obtener(id) {
      await delay()
      const p = mockProveedores.find((x) => x.id === id)
      if (!p) throw new Error('Proveedor no encontrado')
      const evaluaciones = mockEvaluaciones.filter((e) => e.proveedorId === id)
      const documentos = mockDocumentos.filter((d) => d.proveedor === p.razonSocial)
      return { ...p, evaluaciones, documentos, historial: mockHistorial.filter((h) => h.detalle.includes(p.razonSocial.split(' ')[0])) }
    },
    async registrar(payload) {
      await delay(600)
      return { id: `prv-${Date.now()}`, ...payload, estado: 'En revisión', clasificacion: '-' }
    },
    async actualizar(id, payload) {
      await delay(500)
      const idx = mockProveedores.findIndex((x) => x.id === id)
      if (idx === -1) throw new Error('Proveedor no encontrado')
      Object.assign(mockProveedores[idx], payload)
      return mockProveedores[idx]
    },
  },
  evaluaciones: {
    async listar(filtro = {}) {
      await delay()
      let list = [...mockEvaluaciones]
      if (filtro.estado) list = list.filter((e) => e.estado === filtro.estado)
      if (filtro.pendientes) list = list.filter((e) => e.areasPendientes > 0 || ['En proceso', 'En evaluación'].includes(e.estado))
      return list
    },
    async listarCriterios() {
      await delay()
      return mockCriterios
    },
    async guardarBorrador(payload) {
      await delay(500)
      return { ok: true, id: 'borrador-001', ...payload }
    },
    async consolidacion(id = 'ev-2026-001') {
      await delay()
      const ev = mockEvaluaciones.find((e) => e.id === id)
      return {
        ...mockConsolidacion,
        id,
        proveedor: ev?.proveedor || mockConsolidacion.proveedor,
        producto: ev?.producto || mockConsolidacion.producto,
      }
    },
    async aprobar(id) {
      await delay()
      return { ok: true, id, estado: 'Aprobado' }
    },
    async rechazar(id) {
      await delay()
      return { ok: true, id, estado: 'Rechazado' }
    },
  },
  ranking: {
    async listar() {
      await delay()
      return mockRanking
    },
  },
  bitacora: {
    async listar() {
      await delay()
      return mockHistorial
    },
  },
  reportes: {
    async listar(filtro = {}) {
      await delay()
      let filas = [...mockReportes.filas]
      if (filtro.estado && filtro.estado !== 'Todos') {
        filas = filas.filter((f) => f.estado === filtro.estado)
      }
      return { ...mockReportes, filas, total: filas.length }
    },
  },
  criterios: {
    async listar() {
      await delay()
      return mockCriterios.map((c) => ({ ...c }))
    },
    async guardar(lista) {
      await delay(500)
      mockCriterios.splice(0, mockCriterios.length, ...lista.map((c) => ({ ...c })))
      return mockCriterios.map((c) => ({ ...c }))
    },
  },
  unidades: {
    async listar() {
      await delay()
      return mockUnidades.map((u) => ({ ...u }))
    },
    async crear(payload) {
      await delay(500)
      const creada = {
        id: `und-${Date.now()}`,
        activo: payload.activo !== false,
        ...payload,
      }
      mockUnidades.push(creada)
      return { ...creada }
    },
    async actualizar(id, payload) {
      await delay(500)
      const idx = mockUnidades.findIndex((u) => u.id === id)
      if (idx === -1) throw new Error('Unidad no encontrada')
      mockUnidades[idx] = { ...mockUnidades[idx], ...payload }
      return { ...mockUnidades[idx] }
    },
    async guardar(lista) {
      await delay(500)
      mockUnidades.splice(0, mockUnidades.length, ...lista.map((u) => ({ ...u })))
      return mockUnidades.map((u) => ({ ...u }))
    },
  },
  productos: {
    async listar() {
      await delay()
      return mockProductos.map((p) => ({ ...p }))
    },
    async crear(payload) {
      await delay(500)
      const creado = {
        id: `mat-${Date.now()}`,
        ...payload,
      }
      mockProductos.push(creado)
      return { ...creado }
    },
    async actualizar(id, payload) {
      await delay(500)
      const idx = mockProductos.findIndex((p) => p.id === id)
      if (idx === -1) throw new Error('Material no encontrado')
      mockProductos[idx] = { ...mockProductos[idx], ...payload }
      return { ...mockProductos[idx] }
    },
  },
  documentos: {
    async listar() {
      await delay()
      return mockDocumentos
    },
  },
  usuarios: {
    async listar() {
      await delay()
      return mockUsuarios.map((u) => ({ ...u }))
    },
    async crear(payload) {
      await delay(500)
      const creado = { id: `usr-${Date.now()}`, ...payload, estado: payload.estado || 'Activo' }
      mockUsuarios.unshift(creado)
      return { ...creado }
    },
    async actualizar(id, payload) {
      await delay(500)
      const idx = mockUsuarios.findIndex((u) => u.id === id)
      if (idx === -1) throw new Error('Usuario no encontrado')
      mockUsuarios[idx] = { ...mockUsuarios[idx], ...payload }
      return { ...mockUsuarios[idx] }
    },
  },
  roles: {
    async listar() {
      await delay()
      return mockRoles
    },
  },
  configuracion: {
    async obtener() {
      await delay()
      return { ...mockConfiguracion }
    },
    async guardar(payload) {
      await delay(500)
      Object.assign(mockConfiguracion, payload)
      return mockConfiguracion
    },
  },
}
