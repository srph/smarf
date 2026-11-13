/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_URL: string
  readonly DISCORD_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
