import { useSyncExternalStore } from 'react'
import { parse, serialize } from 'cookie'
import { config } from '~/src/config'

// The OAuth access token lives in a cookie (same name and options as before, so existing logins
// carry over). The fetch wrapper reads it per request; React reads it through useToken().

const KEY = config.oauth.cookieKey
const OPTIONS = { path: '/', expires: new Date('10000') }

const listeners = new Set<() => void>()

function getToken(): string {
  return parse(document.cookie)[KEY] || ''
}

function setToken(token: string) {
  document.cookie = serialize(KEY, token, OPTIONS)
  listeners.forEach((listener) => listener())
}

function clearToken() {
  setToken('')
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The current token ('' when logged out); re-renders when it changes. */
function useToken(): string {
  return useSyncExternalStore(subscribe, getToken, () => '')
}

export { getToken, setToken, clearToken, useToken }
