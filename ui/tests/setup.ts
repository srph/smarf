import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { resetDb } from './support/db'
import { server } from './support/handlers'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

beforeEach(() => {
  resetDb()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  server.resetHandlers()
  // Drop every cookie (the auth token lives in one).
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim()
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })
  window.history.replaceState(null, '', '/')
})

afterAll(() => server.close())
