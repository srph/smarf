import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { PageTitle } from '~/src/components/page-title/page-title'
import { Spacer } from '~/src/components/spacer/spacer'
import { Spinner } from '~/src/components/spinner/spinner'
import { HttpError } from '~/src/lib/http'
import { clearPendingLogin, discordRedirectUri, readPendingLogin } from '~/src/lib/discord'
import { useDiscordLoginMutation } from './mutations/use-discord-login-mutation'

type Problem = 'cancelled' | 'expired' | 'rejected' | 'failed'

type Callback = { type: 'ok'; code: string; returnTo: string | null } | { type: Problem }

const MESSAGES: Record<Problem, string> = {
  cancelled: 'Signing in with Discord was cancelled.',
  expired: 'This sign-in has expired. Try again.',
  rejected: "Discord didn't accept the sign-in. Try again.",
  failed: "Couldn't sign in with Discord. Check your connection and try again."
}

/** What Discord sent back, checked against the sign-in the login page started. */
function readCallback(params: URLSearchParams): Callback {
  const error = params.get('error')
  // access_denied: the visitor chose Cancel on Discord.
  if (error) return { type: error === 'access_denied' ? 'cancelled' : 'failed' }

  const pending = readPendingLogin()
  const code = params.get('code')
  if (!code || !pending || pending.state !== params.get('state')) return { type: 'expired' }

  return { type: 'ok', code, returnTo: pending.returnTo }
}

/** Discord sends the visitor here (/login/discord) after they sign in there. */
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

    clearPendingLogin()
    if (callback.type !== 'ok') return

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

  if (problem) {
    return (
      <>
        <PageTitle title="Sign in" />
        <div role="alert">
          <p>{MESSAGES[problem]}</p>
          <Spacer size={4} />
          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded border border-zinc-700 p-2 text-sm font-bold text-zinc-50 ring-sky-500 transition-shadow duration-200 hover:ring-2 focus:ring-2">
            Back to sign in
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Signing in" />
      <div className="flex items-center gap-3 text-zinc-400">
        <Spinner />
        <span>Signing in with Discord…</span>
      </div>
    </>
  )
}

export { LoginDiscordRoute }
