<template>
  <Notivue v-slot="item">
    <Notification :item="item" />
  </Notivue>
  <router-view />
</template>

<script setup>
import { Notivue, Notification } from 'notivue'
</script>
