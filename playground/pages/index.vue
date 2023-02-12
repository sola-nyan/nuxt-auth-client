<script setup lang="ts">
import { ref, useCookie, useNuxtApp, useRuntimeConfig } from '~~/.nuxt/imports'

const endpoint = ref(useRuntimeConfig().public.TEST_ENDPOINT ?? '')
const response = ref('')

const callApi = async () => {
  try {
    const res: any = await $fetch(endpoint.value, {
      headers: {
        Authorization: `Bearer ${await useNuxtApp().$auth.claimIdToken()}`
      }
    })
    response.value = JSON.stringify(res)
  } catch (e) {
    console.log(e)
  }
}

const callApiCookie = async () => {
  try {
    const res: any = await $fetch(endpoint.value, { credentials: 'include' })
    response.value = JSON.stringify(res)
    console.log(res)
  } catch (e) {
    console.log(e)
  }
}
</script>

<template>
  <div>
    <NuxtLink to="/login">
      /login (COOKIE)
    </NuxtLink>
    <hr>
    <NuxtLink to="/aadLogin">
      /aadLogin (AZURE AD)
    </NuxtLink>
    <hr>
    <NuxtLink to="/logout">
      /logout
    </NuxtLink>
    <hr>
    <NuxtLink to="/auth/home">
      /auth/home
    </NuxtLink>
    <hr>
    <NuxtLink to="/auth/hold">
      /auth/hold/
    </NuxtLink>
    <hr>
    <NuxtLink to="/auth/bypass">
      /auth/bypass
    </NuxtLink>
    <hr>
    <button @click="callApi">
      API CALL (Bearer)
    </button>
    <button @click="callApiCookie">
      API CALL (Cookie)
    </button>
    <input v-model="endpoint" type="text" size="80"><br>
    <textarea v-model="response" style="width: 800px; height:400px;" />
  </div>
</template>
