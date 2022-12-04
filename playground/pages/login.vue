<script setup lang="ts">
import { useNuxtApp } from '#app'
import { ref } from '~~/.nuxt/imports'

const form = ref({
  username: '',
  password: ''
})

const login = () => {
  const nuxt = useNuxtApp()
  nuxt.$auth.login(form.value.username, form.value.password)
}
</script>

<template>
  <div>
    <div>
      username <input v-model="form.username" type="text">
    </div>
    <div>
      password <input v-model="form.password" type="text">
    </div>
    <button @click="login">
      LOGIN
    </button>
    <HR />
    loggedin: {{ $auth.isLoggedIn() }}
    <HR />
    <NuxtLink to="/">
      index
    </NuxtLink>
  </div>
</template>
