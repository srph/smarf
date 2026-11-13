import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { DiscordButton } from '~/src/components/discord-button/discord-button'
import { Icon } from '~/src/components/icon/icon'
import { PageTitle } from '~/src/components/page-title/page-title'
import { HttpError } from '~/src/lib/http'
import { clearPendingLogin, discordRedirectUri, readPendingLogin } from '~/src/lib/discord'
import { useDiscordLoginMutation } from './mutations/use-discord-login-mutation'

type Problem = 'cancelled' | 'expired' | 'rejected' | 'failed'

/** `returnTo` is kept either way, so a retry still goes back to the page that asked for login. */
type Callback = { type: 'ok'; code: string; returnTo: string | null } | { type: Problem; returnTo: string | null }

const MESSAGES: Record<Problem, string> = {
  cancelled: "Signing in with Discord was cancelled. Try again whenever you're ready.",
  expired: 'This sign-in has expired. Try again.',
  rejected: "Discord didn't accept the sign-in. Try again.",
  failed: "Couldn't sign in with Discord. Check your connection and try again."
}

/** What Discord sent back, checked against the sign-in the login page started. */
function readCallback(params: URLSearchParams): Callback {
  const pending = readPendingLogin()
  const returnTo = pending?.returnTo ?? null

  const error = params.get('error')
  // access_denied: the visitor chose Cancel on Discord.
  if (error) return { type: error === 'access_denied' ? 'cancelled' : 'failed', returnTo }

  const code = params.get('code')
  if (!code || !pending || pending.state !== params.get('state')) return { type: 'expired', returnTo }

  return { type: 'ok', code, returnTo }
}

/**
 * Discord sends the visitor here (/login/discord) after they sign in there. The Discord button stays
 * in the same place throughout (pending while signing in, then a retry if that fails), so its label
 * animates from one to the other.
 */
const LoginDiscordRoute = () => {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  // Read once: the effect takes the code out of the URL.
  const [callback] = useState(() => readCallback(searchParams))

  const { mutate: discordLogin, status: discordLoginStatus, error: discordLoginError } = useDiscordLoginMutation()

  const started = useRef(false)

  useEffect(() => {
    // Discord's code works once, so StrictMode's second run mustn't send it again.
    if (started.current) return
    started.current = true

    // Only a sign-in that's going ahead uses up the saved one. After a problem, the retry button
    // has already saved its own (child effects run first), which clearing here would throw away.
    if (callback.type !== 'ok') return
    clearPendingLogin()

    // Drop the code from the URL, and leave the return path where GuardedRoute looks once the user loads.
    navigate('/login/discord', {
      replace: true,
      state: callback.returnTo ? { from: { pathname: callback.returnTo } } : null
    })
    discordLogin({ code: callback.code, redirect_uri: discordRedirectUri() })
  }, [callback, discordLogin, navigate])

  const problem: Problem | null =
    callback.type !== 'ok'
      ? callback.type
      : discordLoginStatus === 'error'
        ? discordLoginError instanceof HttpError && discordLoginError.status === 422
          ? 'rejected'
          : 'failed'
        : null

  return (
    <>
      <PageTitle title={problem ? 'Sign in' : 'Signing in'} />
      {problem ? (
        <div
          role="alert"
          className="mb-4 flex animate-rise-in items-start gap-2.5 rounded-md border border-red-400/35 bg-red-950/55 px-3 py-2.5 text-left text-red-300 motion-reduce:animate-none">
          <span className="mt-px text-red-400">
            <Icon icon={ExclamationCircleIcon} />
          </span>
          <span>{MESSAGES[problem]}</span>
        </div>
      ) : null}
      <DiscordButton returnTo={callback.returnTo} pending={!problem} label="Try again with Discord" />
    </>
  )
}

export { LoginDiscordRoute }
