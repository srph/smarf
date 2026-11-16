import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // `~/src/...` resolves from the ui/ root, same as tsconfig `paths`.
    alias: [{ find: /^~\//, replacement: `${import.meta.dirname}/` }]
  },
  // Served on every interface so other machines on the tailnet can open http://mbp.boga-parore.ts.net:13000.
  // allowedHosts: Vite rejects requests whose Host header isn't listed.
  server: {
    host: '0.0.0.0',
    port: 13000,
    strictPort: true,
    allowedHosts: ['mbp', '.ts.net']
  },
  preview: {
    host: '0.0.0.0',
    port: 13002,
    strictPort: true,
    allowedHosts: ['mbp', '.ts.net']
  },
  test: {
    environment: 'jsdom',
    // Same origin as VITE_API_URL, so jsdom makes no CORS preflight requests.
    environmentOptions: { jsdom: { url: 'http://smarf.test/' } },
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    env: {
      VITE_API_URL: 'http://smarf.test/api',
      VITE_DISCORD_CLIENT_ID: 'test-discord-client'
    }
  }
})
