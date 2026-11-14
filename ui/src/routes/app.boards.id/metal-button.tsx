import React from 'react'
import { cn } from 'cn'

type Size = 'md' | 'lg'

interface Props extends Omit<React.ComponentProps<'button'>, 'className' | 'disabled'> {
  size?: Size
  /**
   * Turns graphite and ignores clicks. Uses aria-disabled, not disabled, so the button stays focusable
   * and a tooltip can say why.
   */
  disabled?: boolean
  /** Dims the metal and ignores clicks while its action runs. The caller swaps the label (Saving…, Adding…). */
  busy?: boolean
  /** On hover, a light follows the cursor and a sheen sweeps across once. For a primary action that invites clicks. */
  shine?: boolean
}

const sizes: Record<Size, string> = {
  md: 'h-9 rounded-lg px-3 shadow-md',
  lg: 'h-11.5 rounded-xl pr-5 pl-4 shadow-lg'
}

// Feeds bg-cursor-light, so the highlight follows the pointer.
const trackPointer = (evt: React.PointerEvent<HTMLButtonElement>) => {
  const rect = evt.currentTarget.getBoundingClientRect()
  evt.currentTarget.style.setProperty('--x', `${evt.clientX - rect.left}px`)
  evt.currentTarget.style.setProperty('--y', `${evt.clientY - rect.top}px`)
}

/** An indigo metal button for the board's primary actions. Turns graphite while disabled. */
const MetalButton: React.FC<Props> = ({
  size = 'md',
  type = 'button',
  disabled = false,
  busy = false,
  shine = false,
  onClick,
  onPointerMove,
  children,
  ...props
}) => {
  const handleClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    // Also stops a submit button from submitting its form.
    if (disabled || busy) return evt.preventDefault()
    onClick?.(evt)
  }

  const handlePointerMove = (evt: React.PointerEvent<HTMLButtonElement>) => {
    if (shine) trackPointer(evt)
    onPointerMove?.(evt)
  }

  return (
    <button
      type={type}
      {...props}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      aria-disabled={disabled || undefined}
      aria-busy={busy || undefined}
      className={cn(
        'group relative flex shrink-0 cursor-pointer items-center overflow-hidden border font-bold',
        'border-primary-200/40 bg-indigo-metal text-white inset-shadow-xs shadow-primary-500/45 inset-shadow-white/50 text-shadow-primary-950/50 text-shadow-xs',
        'transition-[filter,translate,scale,color,border-color,box-shadow] duration-250 hover:brightness-110 active:translate-y-px active:scale-99',
        'focus-visible:ring-focus',
        sizes[size],
        busy && 'cursor-progress brightness-90 saturate-75 hover:brightness-90',
        // Graphite: the indigo stops at the padding edge, so the border shows what's behind, not indigo.
        'aria-disabled:cursor-not-allowed aria-disabled:border-white/17 aria-disabled:bg-clip-padding aria-disabled:text-zinc-400 aria-disabled:shadow-black/90 aria-disabled:inset-shadow-white/30 aria-disabled:text-shadow-black/55',
        'aria-disabled:hover:brightness-100 aria-disabled:active:translate-y-0 aria-disabled:active:scale-100'
      )}>
      {/* Graphite, faded in over the indigo while disabled. */}
      <span className="absolute inset-0 bg-graphite-metal opacity-0 transition-opacity duration-250 group-aria-disabled:opacity-100" />

      {shine && (
        <>
          <span className="pointer-events-none absolute inset-0 bg-cursor-light opacity-0 transition-opacity duration-250 group-hover:opacity-100 group-aria-disabled:hidden" />
          <span className="pointer-events-none absolute -inset-y-3 left-0 w-2/5 bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:animate-toolbar-sheen group-aria-disabled:hidden" />
        </>
      )}

      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  )
}

export { MetalButton }
