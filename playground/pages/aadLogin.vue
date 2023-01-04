<!-- eslint-disable no-console -->
<script setup lang="ts">
import { useNuxtApp } from '#app'
const nuxt = useNuxtApp()
nuxt.$auth.login()
</script>

<template>
  <div>
    <div>
      redirecting...
    </div>
  </div>
</template>
