import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '~/src/App'
import { config } from '~/src/config'
import { TEST_TOKEN } from './db'

interface Options {
  /** Start logged in as TEST_USER (default true). */
  loggedIn?: boolean
}

export function setToken(token: string) {
  document.cookie = `${config.oauth.cookieKey}=${token}; path=/`
}

export function getToken() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${config.oauth.cookieKey}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Render the whole app at `path`, like opening that URL in a browser. */
export function renderApp(path = '/', { loggedIn = true }: Options = {}) {
  if (loggedIn) setToken(TEST_TOKEN)
  window.history.pushState(null, '', path)
  const user = userEvent.setup()
  const utils = render(<App />)
  return { user, ...utils }
}

export const currentPath = () => window.location.pathname

export { screen }
