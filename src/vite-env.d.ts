/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_AUTH_STORAGE_KEY: string
  readonly VITE_TOKEN_REFRESH_THRESHOLD: string
  readonly VITE_DGDA_PORTAL_URL: string
  readonly VITE_DGDA_HELP_URL: string
  readonly VITE_DEFAULT_TIMEZONE: string
  readonly VITE_DEFAULT_CURRENCY: string
  readonly VITE_DEFAULT_LANGUAGE: string
  readonly VITE_MAPBOX_TOKEN: string
  readonly VITE_BANGLADESH_MAP_URL: string
  readonly VITE_ENABLE_DEV_TOOLS: string
  readonly VITE_CACHE_DURATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}