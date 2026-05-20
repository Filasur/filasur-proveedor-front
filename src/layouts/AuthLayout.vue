<template>
  <div class="auth-layout">
    <router-view />
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #001529 0%, #003a8c 100%);
  padding: 24px;
}
</style>