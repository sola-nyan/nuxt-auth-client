import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '..'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  auth_client: {
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
      }
    }
  }
})
