import React, { useEffect, useState } from 'react'
import { cn } from 'cn'
import { useLocation, useNavigate } from 'react-router'
import { Tooltip } from '@base-ui/react/tooltip'
import { ArrowUpOnSquareIcon, DocumentDuplicateIcon, EyeIcon } from '@heroicons/react/20/solid'
// Drawn for 16px, so the check keeps its weight at that size.
import { CheckIcon } from '@heroicons/react/16/solid'
import { Icon } from '~/src/components/icon/icon'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { blurSwap, blurSwapHidden } from '~/src/lib/ui/blur-swap'
import { useBoard } from './board-context'
import { BoardToolbarIconButton, BoardToolbarTooltip } from './board-toolbar-tooltip'
import { MetalButton } from './metal-button'
import { useDuplicateBoardMutation } from './mutations/use-duplicate-board-mutation'

// How long Share shows its check.
const COPIED_MS = 1600

/** Copies text to the clipboard: the Clipboard API, or off a secure origin (plain http over Tailscale), the old way. */
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    field.readOnly = true
    // Off-screen to the eye, but selectable.
    Object.assign(field.style, { position: 'fixed', top: '0', left: '0', opacity: '0' })
    document.body.append(field)
    field.select()
    const copied = document.execCommand('copy')
    field.remove()
    return copied
  }
}

/**
 * A visitor's dock, where the owner's toolbar sits: one line saying whose board it is, then Share (copies its link)
 * and Copy (to the visitor's own boards; signed out, it asks them to sign in first).
 */
const BoardVisitorDock: React.FC = () => {
  const { board } = useBoard()

  const { user } = useAuthUser()

  const navigate = useNavigate()

  const location = useLocation()

  const { mutate: duplicateBoard, isPending: isCopying, isError: isCopyError } = useDuplicateBoardMutation(board.slug)

  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (!linkCopied) return
    const timer = setTimeout(() => setLinkCopied(false), COPIED_MS)
    return () => clearTimeout(timer)
  }, [linkCopied])

  const handleShare = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    const button = evt.currentTarget
    const copied = await copyText(`${window.location.origin}/b/${board.slug}`)
    // The fallback's field takes focus to select its text; hand it back.
    button.focus({ preventScroll: true })
    if (copied) setLinkCopied(true)
  }

  const handleCopy = () => {
    // Signing in comes back here, to copy then.
    if (!user) return navigate('/login', { state: { from: location } })
    duplicateBoard(undefined, { onSuccess: (copy) => navigate(`/b/${copy.slug}`) })
  }

  return (
    <Tooltip.Provider delay={200}>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-(--z-board-toolbar) flex justify-center px-4">
        <div
          className={cn(
            // The rise sits on the dock itself, not a wrapper: an ancestor's opacity would cut off its backdrop blur.
            'pointer-events-auto flex h-11.5 min-w-0 animate-toolbar-rise items-center gap-2.5 pr-1 pl-3.5 whitespace-nowrap motion-reduce:animate-none',
            'rounded-xl border border-white/10 bg-zinc-800/60 shadow-2xl ring-1 inset-shadow-xs shadow-black/70 ring-black/50 inset-shadow-white/5 backdrop-blur-lg backdrop-saturate-150',
            // The focus ring's gap matches the glass.
            'focus-gap-zinc-800'
          )}>
          <span className="shrink-0 text-zinc-500">
            <Icon icon={EyeIcon} size={16} />
          </span>

          <p className="mr-2 min-w-0 truncate text-zinc-400">
            You're viewing <b className="font-semibold text-zinc-50">{board.name}</b> by{' '}
            <b className="font-semibold text-zinc-50">{board.owner.name}</b>. Only {board.owner.name} can edit it.
          </p>

          {isCopyError && <span className="shrink-0 text-xs text-red-400">Couldn't copy. Try again.</span>}

          <div className="flex shrink-0 items-center gap-1">
            <BoardToolbarIconButton
              label={linkCopied ? 'Link copied' : 'Copy link'}
              onClick={handleShare}
              className={cn(linkCopied && 'text-green-300 hover:text-green-300')}>
              {/* The share icon and the check swap by shrinking out and growing in. */}
              <span className={cn('col-start-1 row-start-1', blurSwap, linkCopied && cn(blurSwapHidden, 'scale-50'))}>
                <Icon icon={ArrowUpOnSquareIcon} />
              </span>
              <span className={cn('col-start-1 row-start-1', blurSwap, !linkCopied && cn(blurSwapHidden, 'scale-50'))}>
                <Icon icon={CheckIcon} size={16} />
              </span>
            </BoardToolbarIconButton>

            {/* Just "Copy" on the button; the tooltip and its name say where the copy goes. */}
            <BoardToolbarTooltip label="Copy to my boards">
              <MetalButton
                busy={isCopying}
                onClick={handleCopy}
                aria-label={isCopying ? 'Copying…' : 'Copy to my boards'}>
                <Icon icon={DocumentDuplicateIcon} size={16} />
                {isCopying ? 'Copying…' : 'Copy'}
              </MetalButton>
            </BoardToolbarTooltip>
          </div>

          <span className="sr-only" aria-live="polite">
            {linkCopied ? 'Link copied' : ''}
          </span>
        </div>
      </div>
    </Tooltip.Provider>
  )
}

export { BoardVisitorDock }
