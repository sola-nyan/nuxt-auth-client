<template>
  <div>
    <NuxtLink to="/login">
      /login
    </NuxtLink>
    <hr>
    <NuxtLink to="/logout">
      /logout
    </NuxtLink>
    <hr>
    bypass page
    <HR />
    loggedin: {{ $auth.isLoggedIn() }}
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '~~/.nuxt/imports'

definePageMeta({
  auth: false
})
</script>
