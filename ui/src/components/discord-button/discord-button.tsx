import React, { useEffect, useState } from 'react'
import { cn } from 'cn'
import { Spinner } from '~/src/components/spinner/spinner'
import { discordAuthorizeUrl, randomState, savePendingLogin } from '~/src/lib/discord'

interface Props {
  /** The page to go back to once signed in. */
  returnTo: string | null
  /** Signing in with the code Discord sent back: shows a spinner, and isn't a link. */
  pending?: boolean
  label?: string
}

/** Discord's logo mark (Simple Icons). */
const DiscordLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
  </svg>
)

interface Content {
  pending: boolean
  label: string
}

const contentKey = ({ pending, label }: Content) => (pending ? 'pending' : label)

/** The logo and label, or, while pending, a spinner (given more room: its rings sit inside its box) and its label. */
const ButtonContent = ({ pending, label }: Content) => (
  <span className={cn('flex items-center', pending ? 'gap-3' : 'gap-2')}>
    {pending ? <Spinner tone="primary" /> : <DiscordLogo />}
    <span>{pending ? 'Signing in with Discord…' : label}</span>
  </span>
)

/**
 * A link to Discord's sign-in page; Discord then sends the visitor to /login/discord, which shows it again
 * as `pending` and, if signing in fails, as a retry. When its content changes, the old content lifts out
 * and the new one rises in after it.
 */
const DiscordButton = ({ returnTo, pending = false, label = 'Continue with Discord' }: Props) => {
  const [state] = useState(randomState)

  // Saved on mount rather than on click, so any way of following the link (new tab included) works.
  // Not while pending: /login/discord is still using the saved sign-in.
  useEffect(() => {
    if (!pending) savePendingLogin({ state, returnTo })
  }, [pending, state, returnTo])

  // The outgoing content stays mounted until its exit animation ends. `swapped` keeps the first
  // content from animating in on mount.
  const [shown, setShown] = useState<Content>({ pending, label })
  const [leaving, setLeaving] = useState<Content | null>(null)
  const [swapped, setSwapped] = useState(false)
  if (shown.pending !== pending || shown.label !== label) {
    setLeaving(shown)
    setShown({ pending, label })
    setSwapped(true)
  }

  return (
    <a
      href={pending ? undefined : discordAuthorizeUrl(state)}
      aria-disabled={pending || undefined}
      className={cn(
        'flex w-full items-center justify-center overflow-hidden rounded-xl bg-primary-500 px-4 py-3 text-base font-bold text-zinc-50 ring-sky-500 transition-shadow duration-200',
        pending ? 'cursor-progress' : 'hover:ring-2 focus-visible:ring-focus'
      )}>
      {/* One grid cell, so the button keeps its size while the two overlap. */}
      <span className="grid justify-items-center">
        {leaving ? (
          <span
            key={`${contentKey(leaving)}-leaving`}
            className="col-start-1 row-start-1 animate-label-out motion-reduce:hidden"
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) setLeaving(null)
            }}>
            <ButtonContent {...leaving} />
          </span>
        ) : null}
        <span
          key={contentKey(shown)}
          className={cn('col-start-1 row-start-1', swapped && 'animate-label-in motion-reduce:animate-none')}>
          <ButtonContent {...shown} />
        </span>
      </span>
    </a>
  )
}

export { DiscordButton }
