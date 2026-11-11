import { describe, expect, it } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { db, TEST_USER } from './support/db'
import { API, server } from './support/handlers'
import { currentPath, getToken, renderApp, screen, setToken } from './support/render'

describe('auth', () => {
  it('sends logged-out visitors to the login page', async () => {
    renderApp('/b/some-board', { loggedIn: false })

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
  })

  it('logs in with email and password and stores the token', async () => {
    const { user } = renderApp('/login', { loggedIn: false })

    await user.type(await screen.findByPlaceholderText('your@email.com'), TEST_USER.email)
    await user.type(screen.getByPlaceholderText('Enter your password'), TEST_USER.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    // Login then hard-redirects (window.location), which jsdom can't follow; the token is what matters.
    await waitFor(() => expect(getToken()).toMatch(/^token-/))
  })

  it('stays on the login page when the password is wrong', async () => {
    const { user } = renderApp('/login', { loggedIn: false })

    await user.type(await screen.findByPlaceholderText('your@email.com'), TEST_USER.email)
    await user.type(screen.getByPlaceholderText('Enter your password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled())
    expect(getToken()).toBeFalsy()
    expect(currentPath()).toBe('/login')
  })

  it('registers a new account and logs straight in', async () => {
    const { user } = renderApp('/register', { loggedIn: false })

    await user.type(await screen.findByPlaceholderText('your@email.com'), 'new@example.com')
    await user.type(screen.getByPlaceholderText('John Doe'), 'New Person')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'secret123')
    await user.type(screen.getByPlaceholderText('Repeat your password above'), 'secret123')
    await user.click(screen.getByRole('button', { name: /register|sign up|create/i }))

    await waitFor(() => expect(getToken()).toMatch(/^token-/))
    expect(db.users.map((u) => u.email)).toContain('new@example.com')
  })

  it('sends logged-in users away from the login page', async () => {
    renderApp('/login')

    expect(await screen.findByRole('button', { name: 'New Board' })).toBeInTheDocument()
    expect(currentPath()).toBe('/')
  })

  it('logs out when the stored token is rejected', async () => {
    setToken('expired-token')
    renderApp('/', { loggedIn: false })

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
    expect(getToken()).toBeFalsy()
  })

  it('logs out on a 401 from any request', async () => {
    server.use(http.get(`${API}/boards`, () => HttpResponse.json({}, { status: 401 })))
    renderApp('/')

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(getToken()).toBeFalsy()
  })

  it('logs out from the /logout route', async () => {
    renderApp('/logout')

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(getToken()).toBeFalsy()
  })
})
