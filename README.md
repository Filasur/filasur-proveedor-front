# FILASUR - Gestión de Proveedores (Frontend)

Sistema web de evaluación y gestión de proveedores para el curso integrador UTP.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

## Configuración del API

Configura `VITE_BACKEND_URL` en `.env` con la URL base del backend, incluyendo `/api`.

## Páginas del sistema

| Módulo | Ruta | Página |
|--------|------|--------|
| Seguridad | `/login` | Inicio de sesión |
| Dashboard | `/dashboard` | Panel principal |
| Proveedores | `/proveedores` | Listado |
| Proveedores | `/registro-proveedor` | Registro |
| Proveedores | `/proveedores/:id` | Detalle |
| Proveedores | `/proveedores/:id/editar` | Actualizar |
| Evaluaciones | `/evaluaciones` | Pendientes |
| Evaluaciones | `/nueva-evaluacion` | Nueva evaluación |
| Evaluaciones | `/consolidacion` | Consolidación |
| Reportes | `/reportes/evaluaciones` | Reporte de evaluaciones |
| Reportes | `/reportes/proveedores` | Reporte de proveedores |
| Reportes | `/reportes/desempeno` | Reporte de desempeño |
| Reportes | `/bitacora` | Bitácora del sistema |
| Catálogos | `/criterios` | Criterios |
| Catálogos | `/unidades` | Unidades de medida |
| Catálogos | `/productos` | Productos / Materiales |
| Catálogos | `/documentos` | Documentos |
| Seguridad | `/usuarios` | Gestión de usuarios |
| Seguridad | `/roles` | Gestión de roles |
| Sistema | `/configuracion` | Configuración |

## Backend

El frontend consume directamente los endpoints definidos en `src/services/api.js`.

## Alertas y notificaciones

- **Toasts ([Notivue](https://notivue.smastrom.io))**: éxito, error e información tras guardar datos.
- **Confirmaciones ([SweetAlert2](https://sweetalert2.github.io))**: aprobar/rechazar proveedor, exportar reportes.
- Utilidades centralizadas en `src/utils/alerts.js`.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — producción
- `npm run preview` — vista previa del build
