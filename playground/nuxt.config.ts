/* eslint-disable no-console */
import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '..'

console.log('refs: playground/.env')
console.log('-- NUXT CONFIG:')
console.log(`AAD_CLIENT_ID : ${process.env.AAD_CLIENT_ID}`)
console.log(`AAD_TENANT_ID : ${process.env.AAD_TENANT_ID}`)

console.log('-- PLAY GROUND PUBLIC RUNTIME CONFIG:')
console.log(`TEST_ENDPOINT : ${process.env.TEST_ENDPOINT}`)

export default defineNuxtConfig({

  runtimeConfig: {
    public: {
      TEST_ENDPOINT: process.env.TEST_ENDPOINT
    }
  },
  modules: [
    MyModule,
    '@vueuse/nuxt'
  ],
  ssr: false,
  auth_client: {
    SCHEME: 'AZURE_AD',
    SCHEME_CONFIG: {
      COOKIE: {
        API: {
          BASE_URL: '',
          CREDENTIALS: 'same-origin',
          POST_FORM: true,
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
          ENABLE: true,
          BASE_URL: 'https://localhost:8443/',
          CREDENTIALS: 'include'
        }
      },
      AZURE_AD: {
        MSAL: {
          CLIENT_ID: process.env.AAD_CLIENT_ID ?? '',
          TENANT_ID: process.env.AAD_TENANT_ID ?? '',
          REDIRECT_URL: 'https://localhost:3000/aadLogin',
          USE_POPUP_API: false,
          SCOPES: ['User.Read']
        }
      }
    },
    PAGE_PATH: {
      LOGIN: '/aadLogin'
    },
    ROUTER_GUARD_PATHES: ['/auth']
  }
})
