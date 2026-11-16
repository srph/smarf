import React, { useCallback, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { PlayIcon } from '@heroicons/react/16/solid'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { DiscordButton } from '~/src/components/discord-button/discord-button'
import poster from '~/src/assets/images/showcase-poster.jpg'

interface Props {
  videoUrl: string
  /** The login page's Discord sign-in, shared with the button shown when the film ends. */
  discordState: string
  returnTo: string | null
}

const EASE_MORPH = 'cubic-bezier(0.3, 0.7, 0.2, 1)'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** The transform that puts `frame` over `from`: the player grows out of the pill, and shrinks back into it. */
function transformFrom(frame: HTMLElement, from: HTMLElement) {
  const a = from.getBoundingClientRect()
  const b = frame.getBoundingClientRect()
  if (!b.width || !b.height) return null
  return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`
}

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`

/**
 * "What's Smarf? Watch the tour": a pill at the foot of the login page that plays the showcase film over the
 * page. When the film ends, it offers the Discord sign-in.
 */
const ShowcaseFilm: React.FC<Props> = ({ videoUrl, discordState, returnTo }) => {
  const [open, setOpen] = useState(false)
  const [ended, setEnded] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Runs as the player mounts, before it paints. Stable, so re-renders don't replay it.
  const growFromTrigger = useCallback((frame: HTMLDivElement | null) => {
    frameRef.current = frame
    const trigger = triggerRef.current
    if (!frame || !trigger || reducedMotion()) return
    const from = transformFrom(frame, trigger)
    if (from) frame.animate?.([{ transform: from }, { transform: 'none' }], { duration: 450, easing: EASE_MORPH })
  }, [])

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setEnded(false)
      return
    }
    // Shrinks back while the popup fades out (both 300ms).
    const frame = frameRef.current
    const trigger = triggerRef.current
    if (!frame || !trigger || reducedMotion()) return
    const to = transformFrom(frame, trigger)
    if (to)
      frame.animate?.([{ transform: 'none' }, { transform: to }], {
        duration: 300,
        easing: EASE_MORPH,
        fill: 'forwards'
      })
  }

  const watchAgain = () => {
    const video = videoRef.current
    if (!video) return
    setEnded(false)
    video.currentTime = 0
    void video.play()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger
        ref={triggerRef}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/80 py-1.5 pr-5 pl-1.5 whitespace-nowrap shadow-xl shadow-black/50 backdrop-blur-md transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:ring-focus motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <span className="relative h-10 w-18 shrink-0 overflow-hidden rounded-lg">
          <img src={poster} alt="" className="size-full object-cover brightness-75" />
          <span className="absolute inset-0 grid place-items-center text-white">
            <Icon icon={PlayIcon} size={16} />
          </span>
        </span>
        <span className="text-left">
          {/* The space keeps the button's name "What's Smarf? Watch the tour", not "Smarf?Watch". */}
          <span className="block text-sm font-bold">What’s Smarf?</span>{' '}
          <span className="block text-xs text-zinc-400">Watch the tour</span>
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--z-popover) bg-zinc-950/85 backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-(--z-popover) w-full max-w-240 -translate-1/2 px-10 text-zinc-50 transition-opacity duration-300 outline-none focus-gap-zinc-950 data-ending-style:opacity-0 data-starting-style:opacity-0">
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-bold">
              Smarf in a minute
              {duration !== null && (
                <span className="ml-2 text-sm font-medium text-zinc-500 tabular-nums">{formatDuration(duration)}</span>
              )}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="grid size-9 place-items-center rounded-lg text-zinc-400 transition-colors duration-200 hover:bg-white/8 hover:text-zinc-50 focus-visible:ring-focus">
              <Icon icon={XMarkIcon} size={20} />
            </Dialog.Close>
          </div>

          <div
            ref={growFromTrigger}
            className="relative aspect-video origin-top-left overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/60">
            {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- no speech: music, with its words on screen */}
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="size-full"
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onEnded={() => setEnded(true)}
            />
            {ended && (
              <div className="absolute inset-0 grid animate-fade-in place-content-center justify-items-center gap-4 bg-zinc-950/80 text-center backdrop-blur-xs">
                <p className="text-xl font-bold">Make your first board</p>
                <div className="w-75">
                  <DiscordButton state={discordState} returnTo={returnTo} />
                </div>
                <button
                  type="button"
                  onClick={watchAgain}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-zinc-50 focus-visible:ring-focus">
                  Watch again
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-between text-xs text-zinc-500">
            <span>Esc to close</span>
            <Dialog.Close className="font-semibold text-primary-300 transition-colors duration-200 hover:text-primary-200 focus-visible:ring-focus">
              Skip to sign-in
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { ShowcaseFilm }
