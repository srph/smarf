import { config } from '~/src/config'

// Discord sign-in. The login page links to Discord, which sends the visitor back to /login/discord with
// a code (or an error). Meanwhile the link's `state`, and the page to return to, wait in localStorage
// (not sessionStorage, so a link opened in a new tab still works).

const STORAGE_KEY = 'smarf-discord-login'

interface PendingLogin {
  state: string
  /** The page that sent the visitor to log in, if any. */
  returnTo: string | null
}

/** Where Discord sends the visitor back to. Each origin must be listed in the Discord app's OAuth2 redirects. */
const discordRedirectUri = () => `${window.location.origin}/login/discord`

/** A random `state`. getRandomValues, not randomUUID: http://mbp:13000 isn't a secure context. */
const randomState = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('')

/** Discord's authorize page. prompt=none skips the consent screen once the visitor has allowed Smarf. */
function discordAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: config.discord.clientId,
    response_type: 'code',
    redirect_uri: discordRedirectUri(),
    scope: 'identify email',
    state,
    prompt: 'none'
  })
  return `https://discord.com/oauth2/authorize?${params}`
}

// Storage can throw (blocked site data); then the callback reports the sign-in as expired.
function savePendingLogin(login: PendingLogin) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(login))
  } catch {}
}

function readPendingLogin(): PendingLogin | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as PendingLogin) : null
  } catch {
    return null
  }
}

function clearPendingLogin() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export {
  discordRedirectUri,
  randomState,
  discordAuthorizeUrl,
  savePendingLogin,
  readPendingLogin,
  clearPendingLogin,
  type PendingLogin
}
