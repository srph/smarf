import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Keep the env names the app has always used (also set on Netlify).
  // Anything matching these prefixes is bundled into the client.
  envPrefix: ['API_URL', 'OAUTH_CLIENT_'],
  resolve: {
    // `~/src/...` resolves from the ui/ root, same as tsconfig `paths`.
    alias: [{ find: /^~\//, replacement: `${import.meta.dirname}/` }]
  },
  server: {
    // Node resolves localhost to ::1 first; browsers use 127.0.0.1. Bind IPv4 like the API does.
    host: '127.0.0.1',
    port: 1234,
    strictPort: true
  },
  preview: {
    port: 1234
  },
  test: {
    environment: 'jsdom',
    // Same origin as API_URL, so jsdom makes no CORS preflight requests.
    environmentOptions: { jsdom: { url: 'http://smarf.test/' } },
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    env: {
      API_URL: 'http://smarf.test/api',
      OAUTH_CLIENT_ID: 'test-client',
      OAUTH_CLIENT_SECRET: 'test-secret'
    }
  }
})
