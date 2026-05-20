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

## Credenciales mock

Configuradas en `.env`:

- `VITE_MOCK_USER`
- `VITE_MOCK_PASSWORD`

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
| Reportes | `/ranking` | Ranking |
| Reportes | `/historial` | Historial |
| Reportes | `/reportes` | Reportes |
| Catálogos | `/criterios` | Criterios |
| Catálogos | `/productos` | Productos / Materiales |
| Catálogos | `/documentos` | Documentos |
| Seguridad | `/usuarios` | Gestión de usuarios |
| Seguridad | `/roles` | Gestión de roles |
| Sistema | `/configuracion` | Configuración |

## Modo mock vs backend

- `VITE_USE_MOCK=true` → datos en `src/mocks/`
- `VITE_USE_MOCK=false` → API en `VITE_BACKEND_URL`

Para conectar el backend, implemente los endpoints definidos en `src/services/api.js`.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — producción
- `npm run preview` — vista previa del build
