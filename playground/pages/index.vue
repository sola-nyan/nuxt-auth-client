<script setup lang="ts">
import { ref, useCookie, useNuxtApp, useRuntimeConfig } from '~~/.nuxt/imports'

const endpoint = ref(useRuntimeConfig().public.TEST_ENDPOINT ?? '')
const response = ref('')
const attachFile = ref()

const fileChangeEvent = (evt: any) => {
  attachFile.value = evt.target.files[0]
}

const callApi = async () => {
  const form = new FormData()
  form.append('files', attachFile.value)
  try {
    const res: any = await $fetch(`${endpoint.value}`, {
      method: 'post',
      body: form,
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
    <input type="file" @change="fileChangeEvent"><br>
    <textarea v-model="response" style="width: 800px; height:400px;" />
  </div>
</template>
