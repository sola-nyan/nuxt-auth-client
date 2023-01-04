/* eslint-disable require-await */
import { useRuntimeConfig } from '#app'

export const getModOption = () => {
  const cfg = useRuntimeConfig()
  return cfg.public.auth_client
}
