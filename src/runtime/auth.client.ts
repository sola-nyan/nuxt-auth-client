/* eslint-disable require-await */
import { defineNuxtPlugin } from '#app'
import { installAzureADScheme } from './schemes/auth.client.scheme.aad'
import { installCookieScheme } from './schemes/auth.client.scheme.cookie'
import { getModOption } from './schemes/auth.client.utils'

export default defineNuxtPlugin(async (nuxtApp) => {
  const modOption = getModOption()
  switch (modOption.SCHEME) {
    case 'COOKIE' : {
      await installCookieScheme(nuxtApp)
      break
    }
    case 'AZURE_AD': {
      await installAzureADScheme(nuxtApp)
      break
    }
    default:
      break
  }
})
