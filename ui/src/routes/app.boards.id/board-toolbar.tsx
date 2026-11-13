import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import { Tooltip } from '@base-ui/react/tooltip'
import { ExclamationCircleIcon, PencilIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { FavoriteIcon } from '~/src/components/favorite-icon/favorite-icon'
import { useFavoriteBoardMutation } from '~/src/queries/boards/use-favorite-board-mutation'
import { useBoard } from './board-context'
import { useDuplicateBoardMutation } from './mutations/use-duplicate-board-mutation'
import { BoardToolbarAddCategoryButton } from './board-toolbar-add-category-button'
import { BoardToolbarDeletePanel } from './board-toolbar-delete-panel'
import { BoardToolbarMoreMenu } from './board-toolbar-more-menu'
import { BoardToolbarRenamePanel } from './board-toolbar-rename-panel'
import { BoardToolbarSwitcher } from './board-toolbar-switcher'
import { BoardToolbarIconButton } from './board-toolbar-tooltip'
import { useToolbarSaveStatus } from './use-toolbar-save-status'

type Mode = 'idle' | 'rename' | 'delete'

// How long the name glints after a rename.
const RENAMED_MS = 1300

// One thing moves at a time: the dock's top edge. Contents only fade, after the edge starts moving.
const EASE = [0.2, 0.8, 0.2, 1] as const
const grow: Transition = { height: { duration: 0.32, ease: EASE }, opacity: { duration: 0.18, delay: 0.1 } }
const shrink: Transition = { height: { duration: 0.3, ease: EASE }, opacity: { duration: 0.1 } }
const rowBack: Transition = { height: { duration: 0.3, ease: EASE }, opacity: { duration: 0.18, delay: 0.12 } }

/**
 * The board's floating toolbar: a glass dock (switch board, favorite, rename, more) and New category beside it.
 * Renaming and deleting grow the dock into a card in place; New category stays put, disabled, until it closes.
 */
const BoardToolbar: React.FC = () => {
  const { board } = useBoard()

  const navigate = useNavigate()

  const status = useToolbarSaveStatus(board.id)

  const { mutate: favoriteBoard } = useFavoriteBoardMutation(board.id)

  const { mutate: duplicateBoard, isPending: isDuplicating } = useDuplicateBoardMutation(board.id)

  const [mode, setMode] = useState<Mode>('idle')

  const [isDanger, setIsDanger] = useState(false)

  const [justRenamed, setJustRenamed] = useState(false)

  const [dockElement, setDockElement] = useState<HTMLDivElement | null>(null)

  const renameButtonRef = useRef<HTMLButtonElement>(null)

  const moreButtonRef = useRef<HTMLButtonElement>(null)

  const previousModeRef = useRef<Mode>(mode)

  // Closing a card hands focus back to the button that opened it.
  useEffect(() => {
    const previous = previousModeRef.current
    previousModeRef.current = mode
    if (mode !== 'idle' || previous === 'idle') return
    const trigger = previous === 'rename' ? renameButtonRef : moreButtonRef
    trigger.current?.focus({ preventScroll: true })
  }, [mode])

  useEffect(() => {
    if (!justRenamed) return
    const timer = setTimeout(() => setJustRenamed(false), RENAMED_MS)
    return () => clearTimeout(timer)
  }, [justRenamed])

  const close = () => {
    setMode('idle')
    setIsDanger(false)
  }

  const handleRenamed = () => {
    close()
    setJustRenamed(true)
  }

  const handleDangerChange = useCallback((danger: boolean) => setIsDanger(danger), [])

  const isEditing = mode !== 'idle'

  // Escape closes an open card, wherever focus is.
  useEffect(() => {
    if (!isEditing) return
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.key !== 'Escape') return
      setMode('idle')
      setIsDanger(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isEditing])

  return (
    <Tooltip.Provider delay={200}>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-(--z-board-toolbar) flex justify-center px-4">
        <div className="pointer-events-auto flex items-end gap-2">
          <div
            ref={setDockElement}
            className={cn(
              'relative overflow-hidden rounded-xl border border-white/10 bg-zinc-800/80 shadow-2xl ring-1 inset-shadow-xs shadow-black/70 ring-black/50 inset-shadow-white/5 backdrop-blur-md backdrop-saturate-150',
              'transition-colors duration-250',
              isDanger && 'border-red-500/55 bg-red-950/70'
            )}>
            {/* The card grows from the dock's top edge. contain-inline-size keeps it to the dock's width: the row sets that. */}
            <AnimatePresence initial={false}>
              {isEditing && (
                <motion.div
                  key={mode}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: grow }}
                  exit={{ height: 0, opacity: 0, transition: shrink }}
                  className="overflow-hidden contain-inline-size">
                  {mode === 'rename' ? (
                    <BoardToolbarRenamePanel onClose={close} onRenamed={handleRenamed} />
                  ) : (
                    <BoardToolbarDeletePanel onClose={close} onDangerChange={handleDangerChange} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Folded away (not removed) while a card is open, so the dock keeps its width. */}
            <motion.div
              initial={false}
              animate={
                isEditing
                  ? { height: 0, opacity: 0, transition: shrink }
                  : { height: 'auto', opacity: 1, transition: rowBack }
              }
              inert={isEditing}
              className="overflow-hidden">
              <div className="flex h-11 items-center px-1 whitespace-nowrap">
                <BoardToolbarSwitcher status={status} justRenamed={justRenamed} anchor={dockElement} />

                <div className="ml-1 flex items-center gap-0.5">
                  <BoardToolbarIconButton
                    label={board.is_favorite ? 'Unfavorite board' : 'Favorite board'}
                    onClick={() => favoriteBoard({ is_favorite: !board.is_favorite })}>
                    <FavoriteIcon value={board.is_favorite} />
                  </BoardToolbarIconButton>

                  <BoardToolbarIconButton ref={renameButtonRef} label="Rename board" onClick={() => setMode('rename')}>
                    <Icon icon={PencilIcon} />
                  </BoardToolbarIconButton>

                  <BoardToolbarMoreMenu
                    ref={moreButtonRef}
                    isDuplicating={isDuplicating}
                    onDuplicate={() => duplicateBoard(undefined, { onSuccess: (copy) => navigate(`/b/${copy.id}`) })}
                    onDelete={() => setMode('delete')}
                  />
                </div>

                {status === 'error' && (
                  <span className="mr-1 ml-3 flex h-7 items-center gap-1.5 rounded-lg bg-red-500/16 px-2.5 text-xs font-semibold text-red-200">
                    <span className="text-red-400">
                      <Icon icon={ExclamationCircleIcon} size={16} />
                    </span>
                    Couldn't save. Change undone.
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          <BoardToolbarAddCategoryButton locked={isEditing} />
        </div>
      </div>
    </Tooltip.Provider>
  )
}

export { BoardToolbar }
