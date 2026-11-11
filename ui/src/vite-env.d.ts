/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_URL: string
  readonly OAUTH_CLIENT_ID: string
  readonly OAUTH_CLIENT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
