import React, { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { useNavigate } from 'react-router'
import { Spinner } from '~/src/components/spinner/spinner'
import { type Board } from '~/src/types/api'
import { useBoard } from './board-context'
import { useDeleteBoardMutation } from './mutations/use-delete-board-mutation'
import { BoardToolbarPanelClose } from './board-toolbar-panel'

// How long the button has to be held. Matches the fill's duration-1200.
const HOLD_MS = 1200

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

// What goes with the board: "its 2 categories and 3 heroes", or a note that it's empty.
const consequence = (board: Board) => {
  const heroCount = board.categories.reduce((count, category) => count + category.heroes.length, 0)
  if (!board.categories.length) return 'This permanently deletes it. Nothing’s on it yet.'
  const categories = plural(board.categories.length, 'category', 'categories')
  if (!heroCount) return `This permanently deletes its ${categories}.`
  return `This permanently deletes its ${categories} and ${plural(heroCount, 'hero', 'heroes')}.`
}

interface Props {
  onClose: () => void
}

/** The dock as a delete confirmation: what goes with the board, then hold the button (mouse, touch, Enter or Space) to delete. */
const BoardToolbarDeletePanel: React.FC<Props> = ({ onClose }) => {
  const { board } = useBoard()

  const navigate = useNavigate()

  const { mutate: deleteBoard, isPending: isDeleting, isError } = useDeleteBoardMutation(board.id)

  const [isHolding, setIsHolding] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus Cancel, so a stray Enter backs out instead of starting a hold.
  useEffect(() => cancelRef.current?.focus({ preventScroll: true }), [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

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
      <div className="mb-2 flex items-center gap-2">
        {/* The verb is quiet so the name carries the title. */}
        <h2 className="min-w-0 flex-1 leading-tight font-bold break-words">
          <span className="font-normal">Delete</span> “{board.name}”
        </h2>
        <BoardToolbarPanelClose onClick={onClose} />
      </div>

      <p className="text-zinc-300">{consequence(board)}</p>

      <div className="mt-4 flex items-center gap-2">
        {isError && <span className="text-xs text-red-400">Couldn't delete. Try again.</span>}

        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          className="ml-auto h-9 cursor-pointer rounded-lg px-3.5 font-bold text-zinc-300 transition-colors hover:bg-white/8 focus-visible:ring-focus">
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
            'relative h-9 shrink-0 cursor-pointer touch-none overflow-hidden rounded-lg border border-red-500/55 bg-red-500/8 px-3.5 font-bold text-red-300 transition-colors duration-200 select-none',
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
    </div>
  )
}

export { BoardToolbarDeletePanel }
