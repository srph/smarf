import React, { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { useNavigate } from 'react-router'
import { TrashIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { Spinner } from '~/src/components/spinner/spinner'
import { TimeAgo } from '~/src/components/time-ago/time-ago'
import { useBoard } from './board-context'
import { useDeleteBoardMutation } from './mutations/use-delete-board-mutation'
import { BoardToolbarPanelClose } from './board-toolbar-panel'

// How long the button has to be held. Matches the fill's duration-1200.
const HOLD_MS = 1200

interface Props {
  onClose: () => void
  // Tints the whole dock red while the button is held or the delete is running.
  onDangerChange: (danger: boolean) => void
}

/** The dock as a delete confirmation: what goes with the board, then hold the button (mouse, touch, Enter or Space) to delete. */
const BoardToolbarDeletePanel: React.FC<Props> = ({ onClose, onDangerChange }) => {
  const { board } = useBoard()

  const navigate = useNavigate()

  const { mutate: deleteBoard, isPending: isDeleting, isError } = useDeleteBoardMutation(board.id)

  const [isHolding, setIsHolding] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus Cancel, so a stray Enter backs out instead of starting a hold.
  useEffect(() => cancelRef.current?.focus({ preventScroll: true }), [])

  const heroCount = board.categories.reduce((count, category) => count + category.heroes.length, 0)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  useEffect(() => {
    onDangerChange(isHolding || isDeleting)
  }, [isHolding, isDeleting, onDangerChange])

  const startHold = () => {
    if (isDeleting || timerRef.current) return
    setIsHolding(true)
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined
      deleteBoard(undefined, { onSuccess: () => navigate('/'), onSettled: () => setIsHolding(false) })
    }, HOLD_MS)
  }

  // Letting go early backs out. After the hold completes, the delete is already on its way.
  const cancelHold = () => {
    if (!timerRef.current) return
    clearTimeout(timerRef.current)
    timerRef.current = undefined
    setIsHolding(false)
  }

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key !== 'Enter' && evt.key !== ' ') return
    evt.preventDefault()
    if (!evt.repeat) startHold()
  }

  const handleKeyUp = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter' || evt.key === ' ') cancelHold()
  }

  const filled = isHolding || isDeleting

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-500/15 text-red-400">
          <Icon icon={TrashIcon} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="leading-tight font-bold">Delete this board?</h2>
          <p className="text-xs text-zinc-400">This can't be undone.</p>
        </div>
        <BoardToolbarPanelClose onClick={onClose} />
      </div>

      <div className="rounded-lg border border-white/6 bg-black/30 px-3 py-2.5">
        <p className="line-clamp-2 leading-snug font-bold break-words">{board.name}</p>
        <p className="mt-1 text-xs text-zinc-400">
          {board.categories.length} {board.categories.length === 1 ? 'category' : 'categories'} · {heroCount}{' '}
          {heroCount === 1 ? 'hero' : 'heroes'} · edited <TimeAgo time={board.updated_at} />
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          className="h-9 cursor-pointer rounded-lg px-3.5 font-bold text-zinc-300 transition-colors hover:bg-white/8 focus-visible:ring-focus">
          Cancel
        </button>

        <button
          type="button"
          aria-busy={isDeleting || undefined}
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={cancelHold}
          // Holding on touch shouldn't open the long-press menu.
          onContextMenu={(evt) => evt.preventDefault()}
          className={cn(
            'relative h-9 flex-1 cursor-pointer touch-none overflow-hidden rounded-lg border border-red-500/55 bg-red-500/8 font-bold text-red-300 transition-colors duration-200 select-none',
            'focus-visible:ring-focus-danger',
            filled && 'text-white'
          )}>
          <span
            className={cn(
              'absolute inset-0 origin-left bg-linear-to-b from-red-500 to-red-600',
              filled
                ? 'scale-x-100 transition-transform duration-1200 ease-linear'
                : 'scale-x-0 transition-transform duration-250',
              isDeleting && 'transition-none'
            )}
          />
          <span className="relative flex items-center justify-center gap-2">
            {isDeleting && <Spinner />}
            {isDeleting ? 'Deleting…' : 'Hold to delete'}
          </span>
        </button>
      </div>

      {isError && <p className="mt-2 text-xs text-red-400">Couldn't delete the board. Try again.</p>}
    </div>
  )
}

export { BoardToolbarDeletePanel }
