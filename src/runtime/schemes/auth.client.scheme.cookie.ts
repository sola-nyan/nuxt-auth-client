/* eslint-disable require-await */
import { addRouteMiddleware, defineNuxtPlugin, useState, useRuntimeConfig, navigateTo, useCookie, NuxtApp } from '#app'
import ObjectWrapper from '@solanyan/object-wrapper'
import { getModOption } from './auth.client.utils'

interface Dynamic {
  [prop: string]: any
}

type LoginCallback = (success: boolean) => false | void
type LogoutCallback = () => false | void

export const installCookieScheme = async (nuxtApp: NuxtApp) => {
  const modOption = getModOption()
  const schemeConfig = modOption.SCHEME_CONFIG.COOKIE
  const _authClient: any = {}

  const state = useState('auth_client_scheme_cookie_state', () => {
    return {
      isLoggedIn: false,
      onholdNavigate: undefined as any,
      synced: false
    }
  })

  const fetchOption = {
    baseURL: schemeConfig.DEV_MODE.ENABLE ? schemeConfig.DEV_MODE.BASE_URL : schemeConfig.API.BASE_URL,
    credentials: (schemeConfig.DEV_MODE.ENABLE ? schemeConfig.DEV_MODE.CREDENTIALS : schemeConfig.API.CREDENTIALS) as RequestCredentials,
    async onRequest (context: any) {
      const CSRF_OPT = schemeConfig.CSRF

      const method = context.options.method?.toUpperCase() ?? ''
      if (!['post', 'put', 'delete', 'patch'].includes(method)) {
        if (CSRF_OPT.ENABLE) {
          if (context.options.headers === undefined) { context.options.headers = {} }
          context.options.headers[CSRF_OPT.HEADER_NAME] = useCookie(CSRF_OPT.COOKIE_KEY).value
        }
      }
    }
  }

  const _fetch = $fetch.create(fetchOption)

  // function of call sync api for get token and check loggin status.
  const callSyncApi = async (force: boolean) => {
    if (!state.value.synced || force) {
      if (!state.value.synced) {
        state.value.synced = true
        syncPolling()
      }
      try {
        const res = await _fetch(schemeConfig.API.ENDPOINTS.SYNC.PATH) as any

        const prop = schemeConfig.API.ENDPOINTS.SYNC.PROPERTY.LOGGED_IN
        if (prop == null || prop === '') {
          state.value.isLoggedIn = (res) as boolean
        } else {
          const ow = new ObjectWrapper(res)
          state.value.isLoggedIn = ow.getPropVal(prop)
        }
      } catch (res) {
        state.value.isLoggedIn = false
      }
    }
    return state.value.isLoggedIn
  }

  const syncPolling = () => {
    setTimeout(async () => {
      await callSyncApi(true)
      syncPolling()
    }, schemeConfig.API.ENDPOINTS.SYNC.POLLING_SPAN_SEC * 1000)
  }

  // Add login method
  _authClient.login = async (username: string, password: string, loginCallback?: LoginCallback) => {
    let body
    if (schemeConfig.API.POST_FORM) {
      body = new FormData()
      body.append(schemeConfig.API.ENDPOINTS.LOGIN.PROPERTY.USERNAME, username)
      body.append(schemeConfig.API.ENDPOINTS.LOGIN.PROPERTY.PASSWORD, password)
    } else {
      body = {} as Dynamic
      body[schemeConfig.API.ENDPOINTS.LOGIN.PROPERTY.USERNAME] = username
      body[schemeConfig.API.ENDPOINTS.LOGIN.PROPERTY.PASSWORD] = password
    }

    return _fetch.raw(schemeConfig.API.ENDPOINTS.LOGIN.PATH, { method: 'POST', body })
      .then(async (res) => {
        let autoNavigate: boolean | void = true
        const loggedIn = await callSyncApi(true)
        if (loginCallback) {
          autoNavigate = await loginCallback(loggedIn)
        }
        if (autoNavigate !== false) {
        // navigate if onhold exsists
          if (state.value.onholdNavigate !== undefined) {
          // get and clear onhold navigate
            navigateTo(state.value.onholdNavigate)
          } else if (modOption.PAGE_PATH.LOGIN_TO !== undefined) {
          // navigate if login_to exists
            navigateTo(modOption.PAGE_PATH.LOGIN_TO)
          }
        }
        return loggedIn
      })
      .catch(async (res) => {
        state.value.isLoggedIn = false
        if (loginCallback) {
          await loginCallback(false)
        }
        return state.value.isLoggedIn
      })
  }

  // Add logout method
  _authClient.logout = async (logoutCallback?: LogoutCallback) => {
    return _fetch(schemeConfig.API.ENDPOINTS.LOGOUT.PATH, { method: 'POST' }).finally(async () => {
      let autoNavigate: boolean | void = true
      await callSyncApi(true)
      if (logoutCallback) {
        autoNavigate = await logoutCallback()
      }
      if (autoNavigate !== false) {
        if (modOption.PAGE_PATH.LOGOUT_TO !== undefined) {
          navigateTo(modOption.PAGE_PATH.LOGOUT_TO)
        }
      }
      return state.value.isLoggedIn
    })
  }

  // Add check login state method
  _authClient.isLoggedIn = () => {
    return state.value.isLoggedIn
  }

  await callSyncApi(false)

  // provide $auth
  nuxtApp.provide('auth', _authClient)

  // router guard middleware logic
  addRouteMiddleware('auth-client-router-guard', (to, from) => {
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

    // no guard login page
    if (to.path === modOption.PAGE_PATH.LOGIN) {
      return true
    }

    // navigate to login page if access guarded path with no logged in
    for (const guardPath of modOption.ROUTER_GUARD_PATHES) {
      if (to.path.startsWith(guardPath)) {
        state.value.onholdNavigate = to
        return navigateTo(modOption.PAGE_PATH.LOGIN)
      }
    }

    // clear onhold
    if (to.path !== modOption.PAGE_PATH.LOGIN) {
      state.value.onholdNavigate = undefined
    }

    return true
  },
  { global: true }
  )
}
