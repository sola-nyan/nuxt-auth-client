/* eslint-disable no-console */

import { NuxtApp, useState, addRouteMiddleware, navigateTo } from '#app'
import * as msal from '@azure/msal-browser'
import { getModOption } from './auth.client.utils'

const ENABLE_CONSOLE_LOG = false

export const installAzureADScheme = async (nuxtApp: NuxtApp) => {
  const modOption = getModOption()
  const schemeConfig = modOption.SCHEME_CONFIG.AZURE_AD
  const _authClient: any = {}

  const state = useState('auth_client_scheme_aad_state', () => {
    return {
      isLoggedIn: false,
      // onholdNavigate: undefined as any, (inprogress)
      accountInfo: [] as msal.AccountInfo[],
      synced: false
    }
  })

  const msalConfig = {
    auth: {
      clientId: schemeConfig.MSAL.CLIENT_ID,
      authority: `${schemeConfig.MSAL.CLOUD_INSTANCE_ID}/${schemeConfig.MSAL.TENANT_ID}`,
      redirectUri: schemeConfig.MSAL.REDIRECT_URL
    },
    cache: {
      cacheLocation: 'localStorage',
      secureCookies: true
    },
    system: {
      loggerOptions: {
        loggerCallback (loglevel:any, message:any, containsPii:any) {
          if (ENABLE_CONSOLE_LOG) { console.log(message) }
        },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Verbose
      }
    }
  }

  const myMSALObj = new msal.PublicClientApplication(msalConfig)

  const syncAccountInfo = () => {
    const accs: msal.AccountInfo[] = myMSALObj.getAllAccounts()
    state.value.accountInfo = accs
    state.value.isLoggedIn = accs?.length > 0
  }

  await myMSALObj.handleRedirectPromise().then((response: any) => { syncAccountInfo() })

  // basic request
  const request = {
    scopes: schemeConfig.MSAL.SCOPES
  }

  // Add login method
  _authClient.login = (force?: boolean) => {
    if (state.value.isLoggedIn && force !== true) {
      navigateTo(modOption.PAGE_PATH.LOGIN_TO)
      return
    }
    if (schemeConfig.MSAL.USE_POPUP_API) {
      // USE POPUP API
      myMSALObj.loginPopup(request).then((res) => {
        console.log(res)
        state.value.isLoggedIn = true
        navigateTo(modOption.PAGE_PATH.LOGIN_TO)
      })
    } else {
      // USE REDIRECT API
      myMSALObj.loginRedirect(request)
    }
  }

  // Add logout method
  _authClient.logout = (navigatoPath?: string) => {
    if (!state.value.isLoggedIn) {
      if (navigatoPath) {
        navigateTo(navigatoPath)
      } else {
        navigateTo(modOption.PAGE_PATH.LOGIN)
      }
      return
    }
    if (schemeConfig.MSAL.USE_POPUP_API) {
      // USE POPUP API
      myMSALObj.logoutPopup()
    } else {
      // USE REDIRECT API
      myMSALObj.logoutRedirect()
    }
  }

  // Add check login state method
  _authClient.isLoggedIn = () => {
    return state.value.isLoggedIn
  }

  // get accountInfo state method
  // _authClient.getAccountInfo = () => {
  //   return state.value.accountInfo
  // }

  // provide $auth
  nuxtApp.provide('auth', _authClient)

  // router guard middleware logic
  addRouteMiddleware('auth-client-router-guard', (to, from) => {
    if (ENABLE_CONSOLE_LOG) {
      console.log(`navigate : ${from.path} -> ${to.path}`)
    }

    // if user logged in.
    if (state.value.isLoggedIn) {
      // navagate to home if user move to login page directly
      if (to.path === modOption.PAGE_PATH.LOGIN) {
        return navigateTo(modOption.PAGE_PATH.LOGIN_TO)
      }

      // bypass
      return true
    }

    // bypass if meta value key of auth is false.
    if (to.meta?.auth === false) {
      return true
    }

    // navigate to login page if access guarded path with no logged in
    for (const guardPath of modOption.ROUTER_GUARD_PATHES) {
      if (to.path.startsWith(guardPath)) {
        // state.value.onholdNavigate = to
        return navigateTo(modOption.PAGE_PATH.LOGIN)
      }
    }

    // clear onhold
    if (to.path !== modOption.PAGE_PATH.LOGIN) {
      // state.value.onholdNavigate = undefined
    }

    return true
  },
  { global: true }
  )

  syncAccountInfo()
}
