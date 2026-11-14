import React, { createContext, use, useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { LabelSwap } from '~/src/components/label-swap/label-swap'
import { Spinner } from '~/src/components/spinner/spinner'

const BusyContext = createContext(false)

type Phase = 'idle' | 'holding' | 'held'

interface Props {
  /** How long it has to be held, in ms. */
  duration?: number
  /** The held action is running: the fill stays full and the label swaps to its busy text. */
  busy?: boolean
  /** Runs once it's been held for `duration`. Should start something that sets `busy`; the fill drains when that ends. */
  onHold: () => void
  children: React.ReactNode
}

/**
 * A graphite metal button that turns red metal while it's held (mouse, touch, Enter or Space): the red wipes in
 * from the left, under the highlight, and runs `onHold` once it's full. Letting go early drains it. Compose the
 * label from MetalHoldButtonText:
 *
 *   <MetalHoldButton busy={isDeleting} onHold={deleteBoard}>
 *     <MetalHoldButtonText>{isDeleting ? 'Deleting…' : 'Hold to delete'}</MetalHoldButtonText>
 *   </MetalHoldButton>
 */
const MetalHoldButton: React.FC<Props> = ({ duration = 1200, busy = false, onHold, children }) => {
  const [phase, setPhase] = useState<Phase>('idle')

  // Once the held action has run (busy, then not), the button is ready again.
  const [wasBusy, setWasBusy] = useState(busy)
  if (busy !== wasBusy) {
    setWasBusy(busy)
    if (!busy) setPhase('idle')
  }

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const start = () => {
    if (busy || phase !== 'idle') return
    setPhase('holding')
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined
      setPhase('held')
      onHold()
    }, duration)
  }

  // Letting go early backs out. Once held, the action is already on its way.
  const release = () => {
    if (phase !== 'holding') return
    clearTimeout(timerRef.current)
    timerRef.current = undefined
    setPhase('idle')
  }

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key !== 'Enter' && evt.key !== ' ') return
    evt.preventDefault()
    if (!evt.repeat) start()
  }

  const handleKeyUp = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter' || evt.key === ' ') release()
  }

  const filled = phase !== 'idle' || busy

  // The fill and the border take the hold's whole duration to change; letting go drains them in 250ms.
  const holdTiming = phase === 'holding' ? { transitionDuration: `${duration}ms` } : undefined

  return (
    <button
      type="button"
      aria-busy={busy || undefined}
      onPointerDown={start}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={release}
      // Holding on touch shouldn't open the long-press menu.
      onContextMenu={(evt) => evt.preventDefault()}
      style={holdTiming}
      className={cn(
        // Graphite metal (MetalButton's disabled finish) whose border warms as the red fills it.
        'relative h-9 min-w-33 shrink-0 cursor-pointer touch-none overflow-hidden rounded-lg border bg-graphite-metal px-3.5 font-bold text-zinc-50 shadow-md shadow-black/60 select-none text-shadow-black/55 text-shadow-xs hover:brightness-110',
        'transition-[border-color,filter] duration-250 ease-linear focus-visible:ring-focus-danger',
        filled ? 'border-red-300/55' : 'border-white/17'
      )}>
      {/* The red wipes in under the highlight, so the metal changes colour instead of being covered. */}
      <span
        style={holdTiming}
        className={cn(
          'absolute inset-0 bg-red-metal transition-[clip-path] duration-250 ease-linear',
          filled ? 'clip-wipe-full' : 'clip-wipe-empty',
          busy && 'transition-none'
        )}
      />
      <span className="absolute inset-0 rounded-lg inset-shadow-xs inset-shadow-white/30" />

      <span className="relative block">
        <BusyContext value={busy}>{children}</BusyContext>
      </span>
    </button>
  )
}

/** The button's label. Pass whichever text fits, e.g. `{isDeleting ? 'Deleting…' : 'Hold to delete'}`; it swaps when `busy` flips, with a spinner while busy. */
const MetalHoldButtonText: React.FC<React.PropsWithChildren> = ({ children }) => {
  const busy = use(BusyContext)

  return (
    <LabelSwap swapKey={busy ? 'busy' : 'idle'}>
      <span className="flex items-center justify-center gap-2">
        {busy && <Spinner tone="white" />}
        {children}
      </span>
    </LabelSwap>
  )
}

export { MetalHoldButton, MetalHoldButtonText }
