<template>
  <div class="layout">
    <AppSidebar />
    <div class="layout-main">
      <AppHeader />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.layout-main {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  padding: 24px;
  flex: 1;
}
</style>