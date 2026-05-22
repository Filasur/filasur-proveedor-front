/** Catálogo alineado con CatTipoProveedor en BD */
export const TIPOS_PROVEEDOR = [
  { id: 1, nombre: 'Materia prima' },
  { id: 2, nombre: 'Servicio' },
  { id: 3, nombre: 'Mixto' },
]

export function idTipoProveedorDesdeNombre(nombre) {
  const tipo = TIPOS_PROVEEDOR.find((t) => t.nombre === nombre)
  return tipo?.id ?? ''
}
