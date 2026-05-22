export const mockUser = {
  id: 'usr-001',
  nombre: 'Anedd Montezuma',
  email: 'proveedor@filasur.pe',
  rol: 'Compras',
  iniciales: 'AM',
}

export const mockDashboard = {
  resumen: {
    proveedoresRegistrados: 58,
    evaluacionesEnProceso: 12,
    evaluacionesFinalizadas: 36,
    proveedoresAprobados: 27,
    evaluacionesPendientes: 12,
    evaluacionesCompletadas: 36,
    puntajePromedio: 87.5,
    proveedoresActivos: 58,
  },
  evaluacionesRecientes: [
    { id: 1, proveedor: 'Textiles del Sur S.A.C.', producto: 'Bolsa PP 50kg', areasPendientes: 1, estado: 'En proceso', fechaLimite: '20/05/2025' },
    { id: 2, proveedor: 'Inversiones Globales S.A.', producto: 'Bolsa PP 50kg', areasPendientes: 2, estado: 'En evaluación', fechaLimite: '22/05/2025' },
    { id: 3, proveedor: 'Plásticos Nacionales S.A.', producto: 'Bolsa PP 50kg', areasPendientes: 0, estado: 'Finalizada', fechaLimite: '18/05/2025' },
    { id: 4, proveedor: 'Empaques del Perú S.A.C.', producto: 'Hilo Algodón 30/1', areasPendientes: 3, estado: 'En proceso', fechaLimite: '25/05/2025' },
  ],
  proximasVencer: [
    { id: 1, proveedor: 'Textiles del Sur S.A.C.', producto: 'Bolsa PP 50kg', areasPendientes: 1, estado: 'En proceso', fechaLimite: '20/05/2025' },
    { id: 4, proveedor: 'Empaques del Perú S.A.C.', producto: 'Hilo Algodón 30/1', areasPendientes: 3, estado: 'En proceso', fechaLimite: '25/05/2025' },
  ],
  chartPorEstado: {
    total: 40,
    labels: ['En proceso', 'En evaluación', 'Finalizadas'],
    values: [12, 16, 12],
    colors: ['#1890ff', '#69c0ff', '#faad14'],
  },
  chartLabels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  chartScores: [72, 78, 81, 85, 88, 90],
}

export const mockProveedores = [
  {
    id: 'prv-001',
    ruc: '20512345678',
    razonSocial: 'Textiles del Sur S.A.C.',
    tipoProveedor: 'Materia prima',
    rubro: 'Textiles',
    contacto: 'Juan Pérez',
    telefono: '+51 999 111 222',
    correo: 'contacto@textilesdelsur.pe',
    direccion: 'Av. Industrial 120, Lima',
    estado: 'Aprobado',
    clasificacion: 'A',
    puntajePromedio: 4.25,
    evaluaciones: 12,
  },
  {
    id: 'prv-002',
    ruc: '20198765432',
    razonSocial: 'Inversiones Globales S.A.',
    tipoProveedor: 'Servicio',
    rubro: 'Logística',
    contacto: 'María Gómez',
    telefono: '+51 999 333 444',
    correo: 'info@invglobales.pe',
    direccion: 'Calle Los Olivos 45, Arequipa',
    estado: 'En evaluación',
    clasificacion: 'B',
    puntajePromedio: 3.8,
    evaluaciones: 5,
  },
  {
    id: 'prv-003',
    ruc: '20456789123',
    razonSocial: 'Plásticos Nacionales S.A.',
    tipoProveedor: 'Materia prima',
    rubro: 'Embalajes',
    contacto: 'Carlos Ruiz',
    telefono: '+51 999 555 666',
    correo: 'ventas@plasticosnacionales.pe',
    direccion: 'Mz. B Lt. 8, Trujillo',
    estado: 'Aprobado',
    clasificacion: 'A',
    puntajePromedio: 4.6,
    evaluaciones: 8,
  },
  {
    id: 'prv-004',
    ruc: '20333444556',
    razonSocial: 'Empaques del Perú S.A.C.',
    tipoProveedor: 'Materia prima',
    rubro: 'Embalajes',
    contacto: 'Laura Díaz',
    telefono: '+51 999 777 888',
    correo: 'compras@empaquesdelperu.pe',
    direccion: 'Av. Argentina 500, Callao',
    estado: 'Rechazado',
    clasificacion: 'C',
    puntajePromedio: 3.2,
    evaluaciones: 4,
  },
  {
    id: 'prv-005',
    ruc: '20111222333',
    razonSocial: 'Industrias del Norte S.A.C.',
    tipoProveedor: 'Materia prima',
    rubro: 'Hilos',
    contacto: 'Pedro Soto',
    telefono: '+51 999 000 111',
    correo: 'pedidos@indnorte.pe',
    direccion: 'Carretera Norte Km 12, Piura',
    estado: 'Activo',
    clasificacion: 'B',
    puntajePromedio: 4.1,
    evaluaciones: 6,
  },
]

export const mockEvaluaciones = [
  { id: 1, proveedorId: 'prv-001', proveedor: 'Textiles del Sur S.A.C.', producto: 'Bolsa PP 50kg', ordenCompra: 'OC-2025-01562', fechaEvaluacion: '15/05/2025', puntajeFinal: 4.25, estado: 'Aprobado', areasPendientes: 0 },
  { id: 2, proveedorId: 'prv-002', proveedor: 'Inversiones Globales S.A.', producto: 'Bolsa PP 50kg', ordenCompra: 'OC-2025-01540', fechaEvaluacion: '14/05/2025', puntajeFinal: 3.8, estado: 'Observado', areasPendientes: 1 },
  { id: 3, proveedorId: 'prv-003', proveedor: 'Plásticos Nacionales S.A.', producto: 'Bolsa PP 50kg', ordenCompra: 'OC-2025-01501', fechaEvaluacion: '13/05/2025', puntajeFinal: 4.6, estado: 'Aprobado', areasPendientes: 0 },
  { id: 4, proveedorId: 'prv-004', proveedor: 'Empaques del Perú S.A.C.', producto: 'Bolsa PP 50kg', ordenCompra: 'OC-2025-01488', fechaEvaluacion: '12/05/2025', puntajeFinal: 3.2, estado: 'Rechazado', areasPendientes: 0 },
  { id: 5, proveedorId: 'prv-005', proveedor: 'Industrias del Norte S.A.C.', producto: 'Hilo Algodón 30/1', ordenCompra: 'OC-2025-01450', fechaEvaluacion: '10/05/2025', puntajeFinal: 4.1, estado: 'Aprobado', areasPendientes: 0 },
  { id: 6, proveedorId: 'prv-001', proveedor: 'Textiles del Sur S.A.C.', producto: 'Tela cruda 40"', ordenCompra: 'OC-2025-01600', fechaEvaluacion: null, puntajeFinal: null, estado: 'En proceso', areasPendientes: 2 },
  { id: 7, proveedorId: 'prv-002', proveedor: 'Inversiones Globales S.A.', producto: 'Film stretch', ordenCompra: 'OC-2025-01610', fechaEvaluacion: null, puntajeFinal: null, estado: 'En evaluación', areasPendientes: 3 },
]

export const mockCriterios = [
  { id: 1, nombre: 'Calidad del producto', peso: 30, area: 'Calidad', activo: true },
  { id: 2, nombre: 'Cumplimiento de plazos', peso: 25, area: 'Logística', activo: true },
  { id: 3, nombre: 'Atención postventa', peso: 20, area: 'Comercial', activo: true },
  { id: 4, nombre: 'Precio competitivo', peso: 15, area: 'Costos', activo: true },
  { id: 5, nombre: 'Documentación', peso: 10, area: 'Calidad', activo: true },
]

export const mockUnidades = [
  { id: 'und-001', codigo: 'UND', nombre: 'Unidad', descripcion: 'Pieza o unidad de venta', activo: true },
  { id: 'und-002', codigo: 'KG', nombre: 'Kilogramo', descripcion: 'Masa en kilogramos', activo: true },
  { id: 'und-003', codigo: 'MT', nombre: 'Metro', descripcion: 'Longitud en metros lineales', activo: true },
  { id: 'und-004', codigo: 'ROLLO', nombre: 'Rollo', descripcion: 'Rollo de material continuo', activo: true },
  { id: 'und-005', codigo: 'LT', nombre: 'Litro', descripcion: 'Volumen en litros', activo: true },
  { id: 'und-006', codigo: 'M2', nombre: 'Metro cuadrado', descripcion: 'Superficie en metros cuadrados', activo: false },
]

export const mockProductos = [
  { id: 'mat-001', codigo: 'MAT-BOL-PP-50', nombre: 'Bolsa PP 50kg', categoria: 'Embalaje', unidad: 'UND' },
  { id: 'mat-002', codigo: 'MAT-HIL-ALG-30', nombre: 'Hilo Algodón 30/1', categoria: 'Textil', unidad: 'KG' },
  { id: 'mat-003', codigo: 'MAT-TEL-CRU-40', nombre: 'Tela cruda 40"', categoria: 'Textil', unidad: 'MT' },
  { id: 'mat-004', codigo: 'MAT-FILM-ST', nombre: 'Film stretch', categoria: 'Embalaje', unidad: 'ROLLO' },
]

export const mockDocumentos = [
  { id: 'doc-001', proveedor: 'Textiles del Sur S.A.C.', nombre: 'Ficha técnica.pdf', tipo: 'PDF', tamano: '458 KB', fecha: '10/04/2025' },
  { id: 'doc-002', proveedor: 'Textiles del Sur S.A.C.', nombre: 'Certificado de calidad.pdf', tipo: 'PDF', tamano: '612 KB', fecha: '10/04/2025' },
  { id: 'doc-003', proveedor: 'Plásticos Nacionales S.A.', nombre: 'Catálogo de producto.pdf', tipo: 'PDF', tamano: '1.2 MB', fecha: '05/03/2025' },
  { id: 'doc-004', proveedor: 'Inversiones Globales S.A.', nombre: 'ISO 9001.pdf', tipo: 'PDF', tamano: '890 KB', fecha: '20/02/2025' },
]

export const mockRanking = [
  { posicion: 1, proveedor: 'Plásticos Nacionales S.A.', puntaje: 4.6, clasificacion: 'A', evaluaciones: 8 },
  { posicion: 2, proveedor: 'Textiles del Sur S.A.C.', puntaje: 4.25, clasificacion: 'A', evaluaciones: 12 },
  { posicion: 3, proveedor: 'Industrias del Norte S.A.C.', puntaje: 4.1, clasificacion: 'B', evaluaciones: 6 },
  { posicion: 4, proveedor: 'Inversiones Globales S.A.', puntaje: 3.8, clasificacion: 'B', evaluaciones: 5 },
  { posicion: 5, proveedor: 'Empaques del Perú S.A.C.', puntaje: 3.2, clasificacion: 'C', evaluaciones: 4 },
]

export const mockHistorial = [
  { id: 'hist-001', fecha: '15/05/2025 10:30', usuario: 'Anedd Montezuma', accion: 'Evaluación aprobada', detalle: 'Textiles del Sur - Bolsa PP 50kg', modulo: 'Evaluaciones' },
  { id: 'hist-002', fecha: '14/05/2025 16:00', usuario: 'Carlos Vega', accion: 'Proveedor actualizado', detalle: 'Inversiones Globales S.A.', modulo: 'Proveedores' },
  { id: 'hist-003', fecha: '13/05/2025 09:15', usuario: 'Anedd Montezuma', accion: 'Evaluación registrada', detalle: 'Plásticos Nacionales - Bolsa PP 50kg', modulo: 'Evaluaciones' },
  { id: 'hist-004', fecha: '12/05/2025 11:45', usuario: 'Sistema', accion: 'Proveedor rechazado', detalle: 'Empaques del Perú S.A.C.', modulo: 'Evaluaciones' },
  { id: 'hist-005', fecha: '10/05/2025 08:00', usuario: 'María López', accion: 'Nuevo proveedor registrado', detalle: 'Industrias del Norte S.A.C.', modulo: 'Proveedores' },
]

export const mockReportes = {
  total: 36,
  aprobados: 22,
  observados: 8,
  rechazados: 6,
  filas: [
    { id: 1, proveedor: 'Textiles del Sur S.A.C.', producto: 'Bolsa PP 50kg', fechaEvaluacion: '15/05/2025', puntajeFinal: 4.25, estado: 'Aprobado' },
    { id: 2, proveedor: 'Inversiones Globales S.A.', producto: 'Bolsa PP 50kg', fechaEvaluacion: '14/05/2025', puntajeFinal: 3.8, estado: 'Observado' },
    { id: 3, proveedor: 'Plásticos Nacionales S.A.', producto: 'Bolsa PP 50kg', fechaEvaluacion: '13/05/2025', puntajeFinal: 4.6, estado: 'Aprobado' },
    { id: 4, proveedor: 'Empaques del Perú S.A.C.', producto: 'Bolsa PP 50kg', fechaEvaluacion: '12/05/2025', puntajeFinal: 3.2, estado: 'Rechazado' },
    { id: 5, proveedor: 'Industrias del Norte S.A.C.', producto: 'Hilo Algodón 30/1', fechaEvaluacion: '10/05/2025', puntajeFinal: 4.1, estado: 'Aprobado' },
  ],
}

export const mockUsuarios = [
  { id: 'usr-001', nombre: 'Anedd Montezuma', email: 'anedd@filasur.pe', rol: 'Compras', estado: 'Activo' },
  { id: 'usr-002', nombre: 'Carlos Vega', email: 'cvega@filasur.pe', rol: 'Calidad', estado: 'Activo' },
  { id: 'usr-003', nombre: 'María López', email: 'mlopez@filasur.pe', rol: 'Administrador', estado: 'Activo' },
  { id: 'usr-004', nombre: 'Pedro Soto', email: 'psoto@filasur.pe', rol: 'Logística', estado: 'Inactivo' },
]

export const mockRoles = [
  { id: 'rol-001', nombre: 'Administrador', descripcion: 'Acceso total al sistema', modulos: ['Todos'] },
  { id: 'rol-002', nombre: 'Compras', descripcion: 'Gestión de proveedores y evaluaciones', modulos: ['Proveedores', 'Evaluaciones', 'Reportes'] },
  { id: 'rol-003', nombre: 'Calidad', descripcion: 'Evaluación por áreas y criterios', modulos: ['Evaluaciones', 'Criterios'] },
  { id: 'rol-004', nombre: 'Logística', descripcion: 'Evaluación logística y documentos', modulos: ['Evaluaciones', 'Documentos'] },
]

export const mockConsolidacion = {
  id: 1,
  proveedor: 'Textiles del Sur S.A.C.',
  producto: 'Bolsa PP 50kg',
  ordenCompra: 'OC-2025-01562',
  fechaEvaluacion: '15/05/2025',
  periodo: '2026-Q1',
  puntajeFinal: 4.25,
  puntajeMax: 5,
  nivel: 'APROBADO',
  resultado: 'Proveedor apto',
  areas: [
    { area: 'Calidad', evaluador: 'Carlos Vega', puntaje: 4.5, peso: 30, ponderado: 1.35, observaciones: 'Cumple especificaciones.' },
    { area: 'Producción', evaluador: 'María López', puntaje: 4.0, peso: 25, ponderado: 1.0, observaciones: 'Entregas puntuales.' },
    { area: 'Logística', evaluador: 'Pedro Soto', puntaje: 4.2, peso: 25, ponderado: 1.05, observaciones: 'Buena coordinación.' },
    { area: 'Costos', evaluador: 'Anedd Montezuma', puntaje: 4.0, peso: 20, ponderado: 0.8, observaciones: 'Precio competitivo.' },
  ],
  criterios: [
    { nombre: 'Calidad del producto', puntaje: 90, peso: 30 },
    { nombre: 'Cumplimiento de plazos', puntaje: 85, peso: 25 },
    { nombre: 'Atención postventa', puntaje: 88, peso: 20 },
    { nombre: 'Precio competitivo', puntaje: 86, peso: 15 },
    { nombre: 'Documentación', puntaje: 92, peso: 10 },
  ],
  observaciones: 'Proveedor cumple estándares FILASUR. Mejorar tiempos en entregas urgentes.',
}

export const mockConfiguracion = {
  umbralAprobacion: 3.5,
  umbralObservado: 3.0,
  diasAlertaVencimiento: 5,
  notificacionesEmail: true,
  integracionErp: 'Exactus',
}
