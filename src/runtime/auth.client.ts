/* eslint-disable require-await */
import { addRouteMiddleware, defineNuxtPlugin, useState, useRuntimeConfig, navigateTo, useCookie, useRouter } from '#app'

interface Dynamic {
  [prop: string]: any
}

const getModOption = () => {
  const cfg = useRuntimeConfig()
  return cfg.public.auth_client
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const modOption = getModOption()

  const state = useState('auth_client_state', () => {
    return {
      isLoggedIn: false,
      onholdNavigate: undefined as any,
      synced: false
    }
  })

  const _authClient: any = {}

  switch (modOption.SCHEME) {
    // =====================================================================================================================================
    // SCHEME [COOKIE] START
    // =====================================================================================================================================
    case 'COOKIE' : {
      const schemeConfig = modOption.SCHEME_CONFIG.COOKIE
      const fetchOption = {
        baseURL: schemeConfig.DEV_MODE.ENABLE ? schemeConfig.DEV_MODE.BASE_URL : schemeConfig.API.BASE_URL,
        credentials: (schemeConfig.DEV_MODE.ENABLE ? schemeConfig.DEV_MODE.CREDENTIALS : schemeConfig.API.CREDENTIALS) as RequestCredentials,
        async onRequest ({ options }: any) {
          const CSRF_OPT = schemeConfig.CSRF
          if (CSRF_OPT.ENABLE) {
            if (options.headers === undefined) { options.headers = {} }
            options.headers[CSRF_OPT.HEADER_NAME] = useCookie(CSRF_OPT.COOKIE_KEY).value
          }
        }
      }

      const _fetch = $fetch.create(fetchOption)

      // function of call sync api for get token and check loggin status.
      const callSyncApi = async (force: boolean) => {
        if (!state.value.synced || force) {
          state.value.synced = true
          try {
            const res = await _fetch(schemeConfig.API.ENDPOINTS.SYNC.PATH)
            const loggedIn = (res === true)
            state.value.isLoggedIn = loggedIn
            if (loggedIn) {
              if (state.value.onholdNavigate !== undefined) {
                navigateTo(state.value.onholdNavigate)
              } else if (modOption.PAGE_PATH.LOGIN_TO !== undefined) {
                navigateTo(modOption.PAGE_PATH.LOGIN_TO)
              }
            }
          } catch (res) {
            state.value.isLoggedIn = false
          }
        }
      }

      // Add login method
      _authClient.login = async (username: string, password: string) => {
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
          .then((res) => {
            const result = (res.status === 200)
            state.value.isLoggedIn = result
            // navigate if onhold exsists
            if (state.value.onholdNavigate !== undefined) {
              // get and clear onhold navigate
              navigateTo(state.value.onholdNavigate)
            } else if (modOption.PAGE_PATH.LOGIN_TO !== undefined) {
              // navigate if login_to exists
              navigateTo(modOption.PAGE_PATH.LOGIN_TO)
            }
            return state.value.isLoggedIn
          })
          .catch(() => {
            state.value.isLoggedIn = false
            return state.value.isLoggedIn
          })
      }

      // Add logout method
      _authClient.logout = async () => {
        return _fetch(schemeConfig.API.ENDPOINTS.LOGOUT.PATH, { method: 'POST' }).finally(async () => {
          await callSyncApi(true)
          if (modOption.PAGE_PATH.LOGOUT_TO !== undefined) {
            navigateTo(modOption.PAGE_PATH.LOGOUT_TO)
          }
          return state.value.isLoggedIn
        })
      }

      // Add check login state method
      _authClient.isLoggedIn = () => {
        return state.value.isLoggedIn
      }

      await callSyncApi(false)
      break
    }
    // =====================================================================================================================================
    // SCHEME [COOKIE] END
    // =====================================================================================================================================

    default:
      break
  }

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
})
