<template>
  <aside class="sidebar">
    <div class="brand">
      <img src="/favicon.svg" alt="FILASUR" class="brand-logo" width="40" height="40" />
      <div>
        <strong>FILASUR</strong>
        <small>Gestión Proveedores</small>
      </div>
    </div>

    <nav class="menu">
      <template v-for="group in menuGroups" :key="group.id">
        <!-- Enlaces sueltos: Dashboard, Configuración -->
        <template v-if="!group.collapsible">
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

        <!-- Módulos colapsables -->
        <div
          v-else
          class="menu-section"
          :class="{ open: isOpen(group.id), 'has-active': isGroupActive(group) }"
        >
          <button
            type="button"
            class="menu-section-toggle"
            :aria-expanded="isOpen(group.id)"
            @click="toggle(group.id)"
          >
            <span>{{ group.label }}</span>
            <span class="chevron" aria-hidden="true"></span>
          </button>
          <div class="menu-section-items">
            <div class="menu-section-inner">
              <RouterLink
                v-for="item in group.items"
                :key="item.name"
                :to="{ name: item.name }"
                class="menu-item menu-item-sub"
                active-class="active"
              >
                {{ item.label }}
              </RouterLink>
            </div>
          </div>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_GROUPS, MODULOS, hasAccess } from '@/security/permissions'

const route = useRoute()
const auth = useAuthStore()
const expanded = ref(new Set())

const allMenuGroups = [
  {
    id: 'main',
    collapsible: false,
    items: [{ name: 'dashboard', label: 'Dashboard', roles: ROLE_GROUPS.evaluaciones, modulo: MODULOS.evaluaciones }],
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    collapsible: true,
    items: [
      { name: 'proveedores', label: 'Listado de proveedores', roles: ROLE_GROUPS.proveedores, modulo: MODULOS.proveedores },
      { name: 'registro-proveedor', label: 'Registrar proveedor', roles: ROLE_GROUPS.proveedores, modulo: MODULOS.proveedores },
    ],
  },
  {
    id: 'evaluaciones',
    label: 'Evaluaciones',
    collapsible: true,
    items: [
      { name: 'nueva-evaluacion', label: 'Nueva evaluación', roles: ROLE_GROUPS.evaluaciones, modulo: MODULOS.evaluaciones },
      { name: 'consolidacion', label: 'Consolidación', roles: ROLE_GROUPS.evaluaciones, modulo: MODULOS.evaluaciones },
      { name: 'evaluaciones-pendientes', label: 'Evaluaciones pendientes', roles: ROLE_GROUPS.evaluaciones, modulo: MODULOS.evaluaciones },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    collapsible: true,
    items: [
      { name: 'reporte-desempeno', label: 'Reporte desempeño', roles: ROLE_GROUPS.reportes, modulo: MODULOS.reportes },
      { name: 'reporte-evaluaciones', label: 'Reporte evaluaciones', roles: ROLE_GROUPS.reportes, modulo: MODULOS.reportes },
      { name: 'reporte-proveedores', label: 'Reporte proveedores', roles: ROLE_GROUPS.reportes, modulo: MODULOS.reportes },
      { name: 'bitacora', label: 'Bitácora', roles: ROLE_GROUPS.administracion, modulo: MODULOS.bitacora },
    ],
  },
  {
    id: 'catalogos',
    label: 'Catálogos',
    collapsible: true,
    items: [
      { name: 'criterios', label: 'Criterios', roles: ROLE_GROUPS.catalogos, modulo: MODULOS.criterios },
      { name: 'unidades', label: 'Unidades', roles: ROLE_GROUPS.catalogos, modulo: MODULOS.unidades },
      { name: 'productos', label: 'Productos / Materiales', roles: ROLE_GROUPS.catalogos, modulo: MODULOS.productos },
      { name: 'documentos', label: 'Documentos', roles: ROLE_GROUPS.documentos, modulo: MODULOS.documentos },
    ],
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    collapsible: true,
    items: [
      { name: 'usuarios', label: 'Usuarios', roles: ROLE_GROUPS.administracion, modulo: MODULOS.usuarios },
      { name: 'roles', label: 'Roles', roles: ROLE_GROUPS.administracion, modulo: MODULOS.roles },
    ],
  },
  {
    id: 'config',
    collapsible: false,
    items: [{ name: 'configuracion', label: 'Configuración', roles: ROLE_GROUPS.administracion, modulo: MODULOS.configuracion }],
  },
]

const menuGroups = computed(() =>
  allMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasAccess(auth.user, { roles: item.roles, modulo: item.modulo }),
      ),
    }))
    .filter((group) => group.items.length),
)

function isOpen(id) {
  return expanded.value.has(id)
}

function toggle(id) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

function isGroupActive(group) {
  return group.items.some((item) => item.name === route.name)
}

function expandActiveModule() {
  const next = new Set(expanded.value)
  menuGroups.value.forEach((group) => {
    if (group.collapsible && isGroupActive(group)) {
      next.add(group.id)
    }
  })
  expanded.value = next
}

watch(() => route.name, expandActiveModule, { immediate: true })
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  background: var(--filasur-sidebar);
  color: #fff;
  padding: 20px 12px 12px;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}

.brand {
  flex-shrink: 0;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 8px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
  background: #fff;
  padding: 4px;
}

.brand small {
  display: block;
  opacity: 0.75;
  font-size: 11px;
}

.menu {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 4px;
  margin-right: -4px;
}

.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
}

.menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
}

.menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

@supports (scrollbar-color: auto) {
  .menu {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.06);
  }
}

.menu-item {
  padding: 8px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.menu-item-sub {
  font-size: 13px;
  padding: 7px 12px 7px 16px;
}

.menu-item:hover,
.menu-item.active {
  background: var(--filasur-sidebar-active);
  color: #fff;
}

/* Acordeón de módulos */
.menu-section {
  margin-top: 4px;
}

.menu-section-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.menu-section-toggle:hover,
.menu-section.has-active .menu-section-toggle {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.chevron {
  width: 7px;
  height: 7px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-top: -2px;
}

.menu-section.open .chevron {
  transform: rotate(45deg);
  margin-top: 2px;
}

.menu-section-items {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.22s ease;
}

.menu-section.open .menu-section-items {
  grid-template-rows: 1fr;
}

.menu-section-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0 4px;
}
</style>
