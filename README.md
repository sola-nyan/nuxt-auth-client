# NOTICE

Not tested to work well.
This module not recomended for production use.

# FEATURE

- Authentication client for SPA (static site).
- No dependency server, just add client plugin and routeMiddleware.
    - Provide `auth` (useNuxtApp().$auth)

# SCHEME
1. COOKIE 
- Provide methods:
    - do login
        - $auth.login(username: string, password: string): boolean
    - do logout
        - $auth.logout(): boolean
    - do check login status  
        - $auth.isLoggedIn(): boolean
- Description:
    - username and password credential login with CSRF token
    - 
    - more details please check out source code.
- API requrement:
    - login api return status code if sucess = 200, failure = 401
    - sync api return body just boolean if user logged in = true, not logged in = false 
        - Use for initial access cheking login status and update CSRF with http header
2. ANONYMOUS 
- Provide methods:
    - No method provided
        - router guard only

# Install

- Run `npm install @solanyan/nuxt-auth-client`
- Add modules `@solanyan/nuxt-auth-client` and config `auth_client` to `nuxt.config.ts`

# Default Config
    auth_client: {
        SCHEME: 'COOKIE', # 'COOKIE' or 'ANONYMOUS'
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
                    },
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
    }

# Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.

# Licence

MIT License © 2022 Sola-nyan

