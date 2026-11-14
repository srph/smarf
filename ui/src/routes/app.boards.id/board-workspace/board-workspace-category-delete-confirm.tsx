import React, { useEffect, useRef } from 'react'
import { TrashIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'

interface Props {
  name: string
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Asks before a category goes, over the card's header. A red fade comes in from the left, the trash tips, then the
 * question and the buttons rise into place. Cancel takes focus, so a stray Enter backs out; Escape or a click
 * anywhere else backs out too.
 */
const BoardWorkspaceCategoryDeleteConfirm: React.FC<Props> = ({ name, onCancel, onConfirm }) => {
  const ref = useRef<HTMLDivElement>(null)

  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => cancelRef.current?.focus({ preventScroll: true }), [])

  useEffect(() => {
    const handlePointerDown = (evt: PointerEvent) => {
      if (evt.target instanceof Node && ref.current?.contains(evt.target)) return
      onCancel()
    }

    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') onCancel()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    // Sits 1px inside the card so its rim still shows, and runs 12px down under the hero tray so the red fills the
    // tray's rounded top corners. Being 1px in, its corners are the card's radius less 1px, or a sliver of the card
    // shows at each corner. The red is its own layer (before:) so it can fade in under the words.
    <div
      ref={ref}
      // A small inline alert dialog: it asks one question and moves focus into itself (to Cancel).
      role="alertdialog"
      aria-label={`Delete ${name}?`}
      className="absolute inset-x-px top-px -bottom-3 isolate flex items-center gap-2 rounded-t-[calc(var(--radius-xl)-1px)] bg-zinc-800 pr-1.5 pb-3 pl-3 before:absolute before:inset-0 before:-z-10 before:animate-confirm-fade before:rounded-t-[calc(var(--radius-xl)-1px)] before:bg-linear-to-r before:from-red-500/35 before:via-red-500/10 before:via-45% before:to-transparent before:to-80% motion-reduce:before:animate-none">
      <span className="animate-trash-tip text-red-400 motion-reduce:animate-none">
        <Icon icon={TrashIcon} size={16} />
      </span>

      {/* The question steps back; the name and the Delete button carry it. */}
      <p className="min-w-0 animate-confirm-rise truncate motion-reduce:animate-none">
        <span className="text-zinc-400">Delete</span> <span className="font-semibold">{name}</span>?
      </p>

      <div className="ml-auto flex shrink-0 animate-confirm-rise-late gap-1.5 motion-reduce:animate-none">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="h-6 cursor-pointer rounded-md bg-zinc-700 px-2 text-xs font-bold text-zinc-200 hover:bg-zinc-600 focus-visible:ring-focus">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="h-6 cursor-pointer rounded-md bg-red-600 px-2 text-xs font-bold text-white hover:bg-red-500 focus-visible:ring-focus-danger">
          Delete
        </button>
      </div>
    </div>
  )
}

export { BoardWorkspaceCategoryDeleteConfirm }
