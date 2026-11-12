import { describe, expect, it } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { db, seedBoard, TEST_USER } from './support/db'
import { API, server } from './support/handlers'
import { currentPath, getToken, renderApp, screen, setToken } from './support/render'

describe('auth', () => {
  it('sends logged-out visitors to the login page', async () => {
    renderApp('/b/some-board', { loggedIn: false })

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
  })

  it('logs in with email and password and lands on the board list', async () => {
    const { user } = renderApp('/login', { loggedIn: false })

    await user.type(await screen.findByPlaceholderText('your@email.com'), TEST_USER.email)
    await user.type(screen.getByPlaceholderText('Enter your password'), TEST_USER.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('button', { name: 'New Board' })).toBeInTheDocument()
    expect(currentPath()).toBe('/')
    expect(getToken()).toMatch(/^token-/)
  })

  it('returns to the page that asked for login', async () => {
    const board = seedBoard('Ranked', [{ name: 'Carries', heroes: ['Axe'] }])
    const { user } = renderApp(`/b/${board.id}`, { loggedIn: false })

    await user.type(await screen.findByPlaceholderText('your@email.com'), TEST_USER.email)
    await user.type(screen.getByPlaceholderText('Enter your password'), TEST_USER.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByDisplayValue('Carries')).toBeInTheDocument()
    expect(currentPath()).toBe(`/b/${board.id}`)
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

    expect(await screen.findByRole('button', { name: 'New Board' })).toBeInTheDocument()
    expect(getToken()).toMatch(/^token-/)
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

  it('sets the page title', async () => {
    renderApp('/login', { loggedIn: false })

    await screen.findByRole('button', { name: 'Sign in' })
    expect(document.title).toBe('Smarf — Sign in')
  })

  it("offers a retry when the account can't be loaded", async () => {
    let fail = true
    server.use(http.get(`${API}/auth/me`, () => (fail ? HttpResponse.json({}, { status: 500 }) : undefined)))
    const { user } = renderApp('/')

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load your account")
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('button', { name: 'New Board' })).toBeInTheDocument()
    expect(getToken()).toBeTruthy()
  })
})
