import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { DISCORD_CODE, db, seedBoard, TEST_USER } from './support/db'
import { API, server } from './support/handlers'
import { currentPath, getToken, renderApp, screen, setToken } from './support/render'

const discordLink = () => screen.findByRole('link', { name: 'Continue with Discord' })
const retryLink = () => screen.findByRole('link', { name: 'Try again with Discord' })

/** The `state` a Discord link sends, which Discord would send back. */
const stateOf = (link: HTMLElement) => new URL(link.getAttribute('href') ?? '').searchParams.get('state') ?? ''

/**
 * Open `path` logged out and follow the login page's Discord link, as far as leaving for Discord.
 * Returns the link's `state`, which Discord would send back.
 */
async function startDiscordLogin(path = '/login') {
  const { unmount } = renderApp(path, { loggedIn: false })
  const state = stateOf(await discordLink())
  unmount()
  return state
}

/** Discord sending the visitor back to the app. */
const returnFromDiscord = (params: Record<string, string>) =>
  renderApp(`/login/discord?${new URLSearchParams(params)}`, { loggedIn: false })

describe('auth', () => {
  it('sends logged-out visitors to the login page', async () => {
    renderApp('/b/some-board', { loggedIn: false })

    expect(await discordLink()).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
  })

  it("links to Discord's sign-in page", async () => {
    renderApp('/login', { loggedIn: false })

    const url = new URL((await discordLink()).getAttribute('href') ?? '')
    expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize')
    expect(url.searchParams.get('client_id')).toBe('test-discord-client')
    expect(url.searchParams.get('redirect_uri')).toBe('http://smarf.test/login/discord')
    expect(url.searchParams.get('scope')).toBe('identify email')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('state')).toMatch(/^[0-9a-f]{32}$/)
  })

  it('signs in when Discord sends the visitor back, and lands on the board list', async () => {
    const state = await startDiscordLogin()
    returnFromDiscord({ code: DISCORD_CODE, state })

    expect(await screen.findByRole('button', { name: 'New Board' })).toBeInTheDocument()
    expect(currentPath()).toBe('/')
    expect(getToken()).toMatch(/^token-/)
    // Sent once (codes work once), so StrictMode's double effect didn't send it twice.
    expect(db.discordCodes.size).toBe(0)
  })

  it('returns to the page that asked for login', async () => {
    const board = seedBoard('Ranked', [{ name: 'Carries', heroes: ['Axe'] }])
    const state = await startDiscordLogin(`/b/${board.id}`)
    returnFromDiscord({ code: DISCORD_CODE, state })

    expect(await screen.findByDisplayValue('Carries')).toBeInTheDocument()
    expect(currentPath()).toBe(`/b/${board.id}`)
  })

  it('says so when the visitor cancels on Discord, and links straight back to Discord', async () => {
    await startDiscordLogin()
    returnFromDiscord({ error: 'access_denied', state: 'whatever' })

    expect(await screen.findByRole('alert')).toHaveTextContent('Signing in with Discord was cancelled.')
    expect(getToken()).toBeFalsy()

    const url = new URL((await retryLink()).getAttribute('href') ?? '')
    expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize')
  })

  it('signs in from the retry link, and still returns to the page that asked for login', async () => {
    const board = seedBoard('Ranked', [{ name: 'Carries', heroes: ['Axe'] }])
    await startDiscordLogin(`/b/${board.id}`)
    const { unmount } = returnFromDiscord({ error: 'access_denied', state: 'whatever' })
    const state = stateOf(await retryLink())
    unmount()

    returnFromDiscord({ code: DISCORD_CODE, state })

    expect(await screen.findByDisplayValue('Carries')).toBeInTheDocument()
    expect(currentPath()).toBe(`/b/${board.id}`)
  })

  it("doesn't sign in when the state doesn't match the one it sent", async () => {
    await startDiscordLogin()
    returnFromDiscord({ code: DISCORD_CODE, state: 'someone-elses-state' })

    expect(await screen.findByRole('alert')).toHaveTextContent('This sign-in has expired. Try again.')
    expect(getToken()).toBeFalsy()
    expect(db.discordCodes.size).toBe(1)
  })

  it('says so when the API rejects the code', async () => {
    const state = await startDiscordLogin()
    returnFromDiscord({ code: 'used-code', state })

    expect(await screen.findByRole('alert')).toHaveTextContent("Discord didn't accept the sign-in. Try again.")
    expect(getToken()).toBeFalsy()
    expect(await retryLink()).toBeInTheDocument()
  })

  it('takes the code out of the address bar', async () => {
    const state = await startDiscordLogin()
    server.use(http.post(`${API}/auth/discord`, () => new Promise(() => {})))
    returnFromDiscord({ code: DISCORD_CODE, state })

    expect(await screen.findByText('Signing in with Discord…')).toBeInTheDocument()
    expect(window.location.search).toBe('')
  })

  it('sends /register to the login page', async () => {
    renderApp('/register', { loggedIn: false })

    expect(await discordLink()).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
  })

  it('sends logged-in users away from the login page', async () => {
    renderApp('/login')

    expect(await screen.findByRole('button', { name: 'New Board' })).toBeInTheDocument()
    expect(currentPath()).toBe('/')
  })

  it('logs out when the stored token is rejected', async () => {
    setToken('expired-token')
    renderApp('/', { loggedIn: false })

    expect(await discordLink()).toBeInTheDocument()
    expect(currentPath()).toBe('/login')
    expect(getToken()).toBeFalsy()
  })

  it('logs out on a 401 from any request', async () => {
    server.use(http.get(`${API}/boards`, () => HttpResponse.json({}, { status: 401 })))
    renderApp('/')

    expect(await discordLink()).toBeInTheDocument()
    expect(getToken()).toBeFalsy()
  })

  it('logs out from the /logout route', async () => {
    renderApp('/logout')

    expect(await discordLink()).toBeInTheDocument()
    expect(getToken()).toBeFalsy()
  })

  it('sets the page title', async () => {
    renderApp('/login', { loggedIn: false })

    await discordLink()
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

  it("shows the user's email in the account menu only when there is one", async () => {
    db.users[0] = { ...TEST_USER, email: null }
    const { user } = renderApp('/')

    await user.click(await screen.findByTitle('Account menu'))

    expect(await screen.findByText('Test User (@testuser)')).toBeInTheDocument()
    expect(screen.queryByText(TEST_USER.email ?? '')).not.toBeInTheDocument()
  })

  it.each([
    ['only the username when there is no display name', { discord_global_name: null }, 'testuser'],
    ['the username once when the display name matches it', { discord_global_name: 'TestUser' }, 'testuser'],
    [
      "the name when Discord's names haven't been saved yet",
      { discord_username: null, discord_global_name: null },
      'Test User'
    ]
  ])('shows %s in the account menu', async (_, names, shown) => {
    db.users[0] = { ...TEST_USER, ...names }
    const { user } = renderApp('/')

    await user.click(await screen.findByTitle('Account menu'))

    expect(await screen.findByText(shown)).toBeInTheDocument()
  })
})
