import React, { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { CheckIcon, ClipboardIcon, LinkIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { blurSwap, blurSwapHidden } from '~/src/lib/blur-swap'
import { type ID } from '~/src/types/api'
import { BoardToolbarTooltip } from './board-toolbar-tooltip'

// How long Copy says "Copied".
const COPIED_MS = 1600

interface Props {
  boardId: ID
  /** Publishing: a shimmering bar stands in for the link, and Copy waits. */
  pending: boolean
}

/** A public board's link, read-only, with a copy button inside the field. */
const BoardToolbarShareLink: React.FC<Props> = ({ boardId, pending }) => {
  // The board's own URL: the owner gets the editor there, everyone else the read-only view.
  const url = `${window.location.origin}/b/${boardId}`

  const [copied, setCopied] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    const button = evt.currentTarget
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // No Clipboard API off a secure origin (plain http over Tailscale, say), or permission denied: copy the selected
      // link the old way, then hand focus back. If even that fails, the link stays selected to copy by hand.
      const input = inputRef.current
      if (!input) return
      input.focus({ preventScroll: true })
      input.select()
      if (!document.execCommand('copy')) return
      input.setSelectionRange(0, 0)
      button.focus({ preventScroll: true })
      setCopied(true)
    }
  }

  return (
    <div
      className={cn(
        'mt-2 flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-black/25 pl-3 transition-colors duration-250',
        pending ? 'text-zinc-500' : 'text-primary-300'
      )}>
      <Icon icon={LinkIcon} size={14} />

      <div className="relative flex h-full min-w-0 flex-1 items-center">
        {/* A long link fades out at the end, instead of an ellipsis */}
        <input
          ref={inputRef}
          readOnly
          value={url}
          aria-label="Board link"
          tabIndex={pending ? -1 : undefined}
          onFocus={(evt) => evt.currentTarget.select()}
          className={cn(
            'w-full min-w-0 bg-transparent text-sm text-zinc-200 outline-none selection:bg-sky-500/45',
            '[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]',
            blurSwap,
            pending && blurSwapHidden
          )}
        />
        {/* The link's place while it publishes */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-1/2 left-0 h-2.5 w-4/5 -translate-y-1/2 animate-creating-glint rounded-md bg-creating-glint motion-reduce:animate-none',
            'transition-opacity duration-250',
            pending ? 'opacity-20' : 'opacity-0'
          )}
        />
      </div>

      <BoardToolbarTooltip label={copied ? 'Copied' : 'Copy link'}>
        <button
          type="button"
          aria-label={copied ? 'Copied' : 'Copy link'}
          onClick={handleCopy}
          disabled={pending}
          className={cn(
            'mr-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg transition-[background-color,color,opacity,scale] duration-200 active:scale-94',
            'focus-visible:ring-focus disabled:cursor-progress disabled:opacity-40',
            copied ? 'bg-green-500/14 text-green-300' : 'bg-white/8 text-zinc-200 hover:bg-white/13'
          )}>
          {/* The clipboard and the check swap by shrinking out and growing in. */}
          <span className={cn('col-start-1 row-start-1', blurSwap, copied && cn(blurSwapHidden, 'scale-50'))}>
            <Icon icon={ClipboardIcon} size={16} />
          </span>
          <span className={cn('col-start-1 row-start-1', blurSwap, !copied && cn(blurSwapHidden, 'scale-50'))}>
            <Icon icon={CheckIcon} size={16} />
          </span>
        </button>
      </BoardToolbarTooltip>

      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied' : ''}
      </span>
    </div>
  )
}

export { BoardToolbarShareLink }
