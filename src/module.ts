import { fileURLToPath } from 'url'
import { defineNuxtModule, addPlugin, createResolver, isNuxt3, addComponentsDir } from '@nuxt/kit'
import { defu } from 'defu'
/** memo */
type AAD_CLOUD_INSTANCE_ID = 'https://login.microsoftonline.com' | 'https://login.partner.microsoftonline.cn' | 'https://login.microsoftonline.us'
export interface SchemeConfig {
  COOKIE? : {
    API?: {
      BASE_URL?: string
      CREDENTIALS?: RequestCredentials
      POST_FORM?: boolean,
      ENDPOINTS?:{
        LOGIN?: {
          PATH: string
          PROPERTY?: {
            USERNAME?: string
            PASSWORD?: string
          }
        }
        LOGOUT?: {
          PATH: string
        }
        SYNC?: {
          PATH: string,
          POLLING_SPAN_SEC?: number,
          PROPERTY?:{
            LOGGED_IN: string
          }
        }
      }
    },
    CSRF?: {
      ENABLE: boolean
      HEADER_NAME?: string
      COOKIE_KEY?: string
    },
    DEV_MODE?: {
      ENABLE: boolean
      BASE_URL?: string
      CREDENTIALS?: RequestCredentials
    }
  },
  AZURE_AD?: {
    MSAL: {
      CLIENT_ID: string,
      TENANT_ID: string,
      REDIRECT_URL: string,
      CACHE_STORAGE?: string,
      SCOPES?: string[]
      USE_POPUP_API?: boolean,
      CLOUD_INSTANCE_ID?: AAD_CLOUD_INSTANCE_ID | string
    },
    NO_LOGIN_PAGE?: boolean
  },
  ANONYMOUS?: undefined
}

export interface ModuleOptions {
  SCHEME: keyof SchemeConfig,
  SCHEME_CONFIG: SchemeConfig,
  PAGE_PATH: {
    LOGIN?: string
    LOGIN_TO?: string,
    LOGOUT_TO?: string
  }
  ROUTER_GUARD_PATHES: string[],
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@solanyan/nuxt-auth-client',
    configKey: 'auth_client',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    SCHEME: 'COOKIE',
    SCHEME_CONFIG: {
      COOKIE: {
        API: {
          BASE_URL: '',
          CREDENTIALS: 'same-origin',
          POST_FORM: false,
          ENDPOINTS: {
            LOGIN: {
              PATH: '/api/auth/login',
              PROPERTY: {
                USERNAME: 'username',
                PASSWORD: 'password'
              }
            },
            LOGOUT: {
              PATH: '/api/auth/logout'
            },
            SYNC: {
              PATH: '/api/auth/sync',
              POLLING_SPAN_SEC: 180,
              PROPERTY: {
                LOGGED_IN: ''
              }
            }
          }
        },
        CSRF: {
          ENABLE: true,
          HEADER_NAME: 'X-XSRF-TOKEN',
          COOKIE_KEY: 'XSRF-TOKEN'
        },
        DEV_MODE: {
          ENABLE: false,
          BASE_URL: 'https://localhost:8443/',
          CREDENTIALS: 'include'
        }
      },
      AZURE_AD: {
        MSAL: {
          CLIENT_ID: '',
          TENANT_ID: '',
          REDIRECT_URL: '',
          CACHE_STORAGE: 'sessionStorage',
          SCOPES: ['User.Read'],
          USE_POPUP_API: false,
          CLOUD_INSTANCE_ID: 'https://login.microsoftonline.com'
        },
        NO_LOGIN_PAGE: true
      },
      ANONYMOUS: undefined
    },
    PAGE_PATH: {
      LOGIN: '/login',
      LOGIN_TO: '/auth/home',
      LOGOUT_TO: '/'
    },
    ROUTER_GUARD_PATHES: ['/auth']
  },
  setup (options, nuxt) {
    if (nuxt.server !== undefined) {
      return
    }

    if (!isNuxt3()) {
      return
    }

    nuxt.options.runtimeConfig.public.auth_client = defu(
      nuxt.options.runtimeConfig.public.auth_client,
      options
    )

    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    const composableDir = fileURLToPath(new URL('./runtime/', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    addPlugin(resolve(runtimeDir, 'auth.client'))

    addComponentsDir({
      path: resolve(runtimeDir, 'schemes'),
      pathPrefix: false,
      prefix: '',
      global: false
    })
  }
})
