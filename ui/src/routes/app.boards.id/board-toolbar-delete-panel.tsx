import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { type Board } from '~/src/types/api'
import { useBoard } from './board-context'
import { useDeleteBoardMutation } from './mutations/use-delete-board-mutation'
import { BoardToolbarPanelClose } from './board-toolbar-panel'
import { MetalHoldButton, MetalHoldButtonText } from './metal-hold-button'

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

  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus Cancel, so a stray Enter backs out instead of starting a hold.
  useEffect(() => cancelRef.current?.focus({ preventScroll: true }), [])

  const handleHold = () => deleteBoard(undefined, { onSuccess: () => navigate('/') })

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center gap-2">
        {/* The verb is light so the name carries the title. Needs Interstate Light in the Adobe Fonts kit; until then it falls back to 500. */}
        <h2 className="min-w-0 flex-1 leading-tight font-bold break-words">
          <span className="font-light">Delete</span> {board.name}
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

        <MetalHoldButton busy={isDeleting} onHold={handleHold}>
          <MetalHoldButtonText>{isDeleting ? 'Deleting…' : 'Hold to delete'}</MetalHoldButtonText>
        </MetalHoldButton>
      </div>
    </div>
  )
}

export { BoardToolbarDeletePanel }
