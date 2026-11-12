import { config } from '~/src/config'
import { getToken } from './token'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface Options {
  method?: Method
  body?: unknown
  headers?: Record<string, string>
  /** Aborts the request (TanStack Query passes one, so unused queries cancel their fetch). */
  signal?: AbortSignal
}

/** A non-2xx response. `body` is the parsed JSON error, when there is one. */
class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown
  ) {
    super(`Request failed with status ${status}`)
    this.name = 'HttpError'
  }
}

const unauthorizedListeners = new Set<() => void>()

/** Called on any 401 except from the login endpoint (an expired or revoked token). */
function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

const url = (path: string) => `${config.api.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`

/** JSON request to the API with the bearer token. Resolves to the parsed body; throws HttpError on non-2xx. */
async function http<T = unknown>(path: string, { method = 'GET', body, headers, signal }: Options = {}): Promise<T> {
  const token = getToken()

  const response = await fetch(url(path), {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal
  })

  const text = await response.text()
  const data = text ? safeJson(text) : null

  if (!response.ok) {
    if (response.status === 401 && !path.includes('oauth/token')) {
      unauthorizedListeners.forEach((listener) => listener())
    }
    throw new HttpError(response.status, data)
  }

  return data as T
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export { http, HttpError, onUnauthorized }
