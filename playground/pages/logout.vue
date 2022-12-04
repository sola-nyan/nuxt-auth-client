<template>
  <div>
    logout
    <hr>
    <NuxtLink to="/">
      /index
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'

const nuxt = useNuxtApp()
nuxt.$auth.logout()
</script>
