import { fileURLToPath } from 'url'
import { defineNuxtModule, addPlugin, createResolver, isNuxt3 } from '@nuxt/kit'
import { defu } from 'defu'

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
          PATH: string
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
              PATH: '/api/auth/sync'
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
    if (!isNuxt3()) {
      return
    }

    nuxt.options.runtimeConfig.public.auth_client = defu(
      nuxt.options.runtimeConfig.public.auth_client,
      options
    )

    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    addPlugin(resolve(runtimeDir, 'auth.client'))
  }
})
