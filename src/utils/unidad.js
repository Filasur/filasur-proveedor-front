/** Misma forma que devuelve GET /api/unidades (Catálogos → Unidades). */
export function normalizarUnidad(raw) {
  if (!raw || typeof raw !== 'object') return null
  const activoRaw = raw.activo ?? raw.Activo
  let activo = true
  if (activoRaw !== undefined && activoRaw !== null) {
    if (typeof activoRaw === 'string') {
      activo = activoRaw === '1' || activoRaw.toLowerCase() === 'true'
    } else {
      activo = Boolean(activoRaw)
    }
  }
  return {
    id: Number(raw.id ?? raw.Id),
    codigo: String(raw.codigo ?? raw.Codigo ?? '').trim().toUpperCase(),
    nombre: String(raw.nombre ?? raw.Nombre ?? '').trim(),
    descripcion: raw.descripcion ?? raw.Descripcion ?? null,
    activo,
  }
}

export function normalizarUnidades(lista) {
  const arr = Array.isArray(lista) ? lista : []
  return arr.map(normalizarUnidad).filter(Boolean)
}

export function esUnidadActiva(u) {
  if (!u) return false
  const v = u.activo
  if (v === true || v === 1) return true
  if (v === false || v === 0) return false
  if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1'
  return Boolean(v)
}

export function etiquetaUnidad(u) {
  if (!u) return ''
  return `${u.codigo} — ${u.nombre}${u.activo ? '' : ' (inactiva)'}`
}

export function unidadPorCodigo(unidades, codigo) {
  if (!codigo) return null
  const c = String(codigo).trim().toUpperCase()
  return unidades.find((u) => u.codigo.toUpperCase() === c) ?? null
}
