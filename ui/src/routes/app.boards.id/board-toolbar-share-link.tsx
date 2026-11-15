import React, { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { CheckIcon, GlobeAltIcon, LinkIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { blurSwap, blurSwapHidden } from '~/src/lib/blur-swap'
import { type ID } from '~/src/types/api'

// How long Copy says "Copied".
const COPIED_MS = 1600

interface Props {
  boardId: ID
  /** Publishing: a shimmering bar stands in for the link, and Copy waits. */
  pending: boolean
}

/** A public board's link, read-only, with Copy inside the field. */
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // No clipboard (an insecure origin, or permission denied): select the link to copy by hand.
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }

  return (
    <div
      className={cn(
        'mt-2 flex h-10 items-center gap-2 rounded-lg border bg-black/25 pl-3 transition-colors duration-250',
        pending ? 'border-white/8 text-zinc-500' : 'border-primary-400/35 text-primary-300'
      )}>
      <Icon icon={GlobeAltIcon} size={14} />

      <div className="relative flex h-full min-w-0 flex-1 items-center">
        <input
          ref={inputRef}
          readOnly
          value={url}
          aria-label="Board link"
          tabIndex={pending ? -1 : undefined}
          onFocus={(evt) => evt.currentTarget.select()}
          className={cn(
            'w-full min-w-0 truncate bg-transparent text-sm text-zinc-200 outline-none selection:bg-sky-500/45',
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

      <button
        type="button"
        onClick={handleCopy}
        disabled={pending}
        className={cn(
          'mr-1.5 grid h-7 shrink-0 cursor-pointer items-center rounded-md px-2.5 text-sm font-semibold transition-[background-color,color,opacity] duration-200',
          'focus-visible:ring-focus disabled:cursor-progress disabled:opacity-40',
          copied ? 'bg-green-500/14 text-green-300' : 'bg-white/8 text-zinc-200 hover:bg-white/13'
        )}>
        <span
          aria-hidden={copied}
          className={cn('col-start-1 row-start-1 flex items-center gap-1.5', blurSwap, copied && blurSwapHidden)}>
          <Icon icon={LinkIcon} size={14} />
          Copy
        </span>
        <span
          aria-hidden={!copied}
          className={cn('col-start-1 row-start-1 flex items-center gap-1.5', blurSwap, !copied && blurSwapHidden)}>
          <Icon icon={CheckIcon} size={14} />
          Copied
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied' : ''}
      </span>
    </div>
  )
}

export { BoardToolbarShareLink }
