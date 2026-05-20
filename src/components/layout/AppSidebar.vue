<template>
  <aside class="sidebar">
    <div class="brand">
      <span class="brand-mark">F</span>
      <div>
        <strong>FILASUR</strong>
        <small>Gestión Proveedores</small>
      </div>
    </div>

    <nav class="menu">
      <template v-for="group in menuGroups" :key="group.label || 'main'">
        <p v-if="group.label" class="menu-group">{{ group.label }}</p>
        <RouterLink
          v-for="item in group.items"
          :key="item.name"
          :to="{ name: item.name }"
          class="menu-item"
          active-class="active"
        >
          {{ item.label }}
        </RouterLink>
      </template>
    </nav>
  </aside>
</template>

<script setup>
const menuGroups = [
  {
    label: null,
    items: [{ name: 'dashboard', label: 'Dashboard' }],
  },
  {
    label: 'Proveedores',
    items: [
      { name: 'proveedores', label: 'Listado de proveedores' },
      { name: 'registro-proveedor', label: 'Registrar proveedor' },
    ],
  },
  {
    label: 'Evaluaciones',
    items: [
      { name: 'evaluaciones-pendientes', label: 'Evaluaciones pendientes' },
      { name: 'nueva-evaluacion', label: 'Nueva evaluación' },
      { name: 'consolidacion', label: 'Consolidación' },
    ],
  },
  {
    label: 'Ranking y reportes',
    items: [
      { name: 'ranking', label: 'Ranking' },
      { name: 'historial', label: 'Historial' },
      { name: 'reportes', label: 'Reportes' },
    ],
  },
  {
    label: 'Catálogos',
    items: [
      { name: 'criterios', label: 'Criterios' },
      { name: 'productos', label: 'Productos / Materiales' },
      { name: 'documentos', label: 'Documentos' },
    ],
  },
  {
    label: 'Seguridad',
    items: [
      { name: 'usuarios', label: 'Usuarios' },
      { name: 'roles', label: 'Roles' },
    ],
  },
  {
    label: null,
    items: [{ name: 'configuracion', label: 'Configuración' }],
  },
]
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-height: 100vh;
  background: var(--filasur-sidebar);
  color: #fff;
  padding: 20px 12px;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 16px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--filasur-sidebar-active);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.brand small {
  display: block;
  opacity: 0.75;
  font-size: 11px;
}

.menu-group {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.55;
  padding: 12px 12px 4px;
  margin: 0;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  padding: 8px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.menu-item:hover,
.menu-item.active {
  background: var(--filasur-sidebar-active);
  color: #fff;
}
</style>
