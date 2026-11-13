import React, { useEffect, useRef, useState } from 'react'
import { Spinner } from '~/src/components/spinner/spinner'
import { useBoard } from './board-context'
import { useUpdateBoardMutation } from './mutations/use-update-board-mutation'
import { BoardToolbarKbd, BoardToolbarPanelClose } from './board-toolbar-panel'

interface Props {
  onClose: () => void
  onRenamed: () => void
}

/** The dock as a rename form: the whole name, pre-selected. Enter saves, Escape (handled by the dock) cancels. */
const BoardToolbarRenamePanel: React.FC<Props> = ({ onClose, onRenamed }) => {
  const { board } = useBoard()

  const [name, setName] = useState(board.name)

  const { mutate: updateBoard, isPending, isError } = useUpdateBoardMutation(board.id)

  const inputRef = useRef<HTMLInputElement>(null)

  // Opening the card puts the cursor in the field with the whole name selected, ready to retype.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
    inputRef.current?.select()
  }, [])

  const trimmed = name.trim()

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    if (!trimmed || isPending) return
    if (trimmed === board.name) return onClose()
    updateBoard({ name: trimmed }, { onSuccess: onRenamed })
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">Rename board</h2>
        <BoardToolbarPanelClose onClick={onClose} />
      </div>

      <input
        ref={inputRef}
        value={name}
        onChange={(evt) => setName(evt.target.value)}
        aria-label="Board name"
        spellCheck={false}
        className="block h-10 w-full rounded-lg border border-sky-500 bg-zinc-900 px-3 font-semibold text-zinc-50 ring-3 ring-sky-500/20 outline-none selection:bg-sky-500/45"
      />

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          {isError ? (
            <span className="text-red-400">Couldn't rename. Try again.</span>
          ) : (
            <>
              <BoardToolbarKbd>Esc</BoardToolbarKbd> to cancel
            </>
          )}
        </span>

        <button
          type="submit"
          disabled={!trimmed || isPending}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-primary-200/40 bg-indigo-metal pr-2 pl-3.5 font-bold text-white shadow-md inset-shadow-xs shadow-primary-500/40 inset-shadow-white/50 transition-[filter] text-shadow-primary-950/50 text-shadow-xs hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100">
          {isPending ? 'Saving…' : 'Save'}
          {isPending ? <Spinner /> : <BoardToolbarKbd tone="light">↵</BoardToolbarKbd>}
        </button>
      </div>
    </form>
  )
}

export { BoardToolbarRenamePanel }
