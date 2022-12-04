<template>
  <div>
    <div>/auth/home</div>
    <NuxtLink to="/">
      /index
    </NuxtLink>
    <hr>
    <NuxtLink to="/logout">
      /logout
    </NuxtLink>
    <hr>
    loggedin: {{ $auth.isLoggedIn() }}
  </div>
</template>

<script setup>
</script>
