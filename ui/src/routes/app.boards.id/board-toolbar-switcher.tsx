import React, { useLayoutEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { useNavigate } from 'react-router'
import { Popover } from '@base-ui/react/popover'
import { ScrollArea } from '@base-ui/react/scroll-area'
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon, PlusIcon, StarIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { favoritesFirst } from '~/src/queries/boards/favorites-first'
import { useBoardsQuery } from '~/src/queries/boards/use-boards-query'
import { type BoardSummary } from '~/src/types/api'
import { useBoard } from './board-context'
import { BoardToolbarTooltip } from './board-toolbar-tooltip'
import { type ToolbarSaveStatus } from './use-toolbar-save-status'

interface Props {
  status: ToolbarSaveStatus
  // True for a moment after a rename is saved: the name glints.
  justRenamed: boolean
  // The dock, so the menu lines up with its left edge rather than the button's.
  anchor: Element | null
}

const STATUS_DOT: Record<ToolbarSaveStatus, string> = {
  saved: 'bg-green-500',
  saving: 'bg-sky-500',
  error: 'bg-red-500'
}

const STATUS_LABEL: Record<ToolbarSaveStatus, string> = {
  saved: 'Saved',
  saving: 'Saving',
  error: "Couldn't save"
}

/** The board's name, its save status, and a searchable menu to switch boards or start a new one. */
const BoardToolbarSwitcher: React.FC<Props> = ({ status, justRenamed, anchor }) => {
  const { board } = useBoard()

  const [open, setOpen] = useState(false)

  const nameRef = useRef<HTMLSpanElement>(null)

  const isTruncated = useIsTruncated(nameRef, board.name)

  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`Switch board (current: ${board.name})`}
        className={cn(
          // A fixed width, so the dock doesn't resize with the name: a long one fades out at the edge instead. It's
          // drawn as a select field, chevron at its edge, so a short name's empty space reads as room in the field.
          'flex h-9 w-48.5 shrink-0 cursor-pointer items-center rounded-lg pr-1.5 pl-3 font-semibold transition-colors duration-150',
          'bg-white/4 hover:bg-white/8 focus-visible:ring-focus data-popup-open:bg-white/8'
        )}>
        <span className="relative size-2 shrink-0">
          <span className={cn('absolute inset-0 rounded-full transition-colors duration-250', STATUS_DOT[status])} />
          {status === 'saving' && <span className="absolute inset-0 animate-ping rounded-full bg-sky-500" />}
        </span>
        <output className="sr-only">{STATUS_LABEL[status]}</output>

        <BoardToolbarTooltip label={board.name} disabled={!isTruncated}>
          <span
            ref={nameRef}
            key={justRenamed ? 'glint' : 'name'}
            className={cn(
              'ml-2 block min-w-0 flex-1 overflow-hidden text-left whitespace-nowrap',
              isTruncated && '[mask-image:linear-gradient(to_right,black_calc(100%-36px),transparent)]',
              justRenamed && 'animate-name-glint bg-name-glint bg-clip-text text-transparent'
            )}>
            {board.name}
          </span>
        </BoardToolbarTooltip>

        <span className="ml-3 text-zinc-500">
          <Icon icon={ChevronUpDownIcon} size={16} />
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          side="top"
          align="start"
          sideOffset={10}
          anchor={anchor}
          positionMethod="fixed"
          className="z-(--z-popover)">
          <Popover.Popup
            initialFocus={searchRef}
            onKeyDown={moveBetweenRows}
            className={cn(
              'w-84 rounded-xl border border-white/10 bg-zinc-800/95 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-md outline-none focus-gap-zinc-800',
              'transition-[opacity,translate] duration-200 data-ending-style:translate-y-1 data-ending-style:opacity-0 data-ending-style:duration-150',
              'data-starting-style:translate-y-1 data-starting-style:opacity-0'
            )}>
            <BoardSwitcherList searchRef={searchRef} onDone={() => setOpen(false)} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

// Up and down move through the rows (and back to the search field); the rows are buttons, so Enter opens one.
const moveBetweenRows = (evt: React.KeyboardEvent<HTMLElement>) => {
  if (evt.key !== 'ArrowDown' && evt.key !== 'ArrowUp') return
  const rows = Array.from(evt.currentTarget.querySelectorAll<HTMLElement>('[data-row]'))
  if (!rows.length) return
  evt.preventDefault()
  const index = rows.indexOf(document.activeElement as HTMLElement)
  const next = evt.key === 'ArrowDown' ? index + 1 : index - 1
  rows[Math.max(0, Math.min(rows.length - 1, next))]?.focus()
}

interface ListProps {
  searchRef: React.RefObject<HTMLInputElement | null>
  onDone: () => void
}

/** Search, favorites, the rest, and New board. */
const BoardSwitcherList: React.FC<ListProps> = ({ searchRef, onDone }) => {
  const { board } = useBoard()

  const navigate = useNavigate()

  const [query, setQuery] = useState('')

  const { data: boards, status: boardsStatus } = useBoardsQuery(favoritesFirst)

  const open = (id: string) => {
    onDone()
    if (id !== board.id) navigate(`/b/${id}`)
  }

  // Nothing is saved until a start is chosen on /b/new.
  const handleNewBoard = () => {
    onDone()
    navigate('/b/new')
  }

  const matches = (b: BoardSummary) => b.name.toLowerCase().includes(query.trim().toLowerCase())
  const favorites = boardsStatus === 'success' ? boards.filter((b) => b.is_favorite && matches(b)) : []
  const others = boardsStatus === 'success' ? boards.filter((b) => !b.is_favorite && matches(b)) : []

  // A text field always matches :focus-visible, so the search ring tracks it itself: it shows only when Tab or the
  // arrows bring focus back to the field, not when the menu opens or the field is clicked.
  const viaKeyboard = useRef(false)
  const [searchRing, setSearchRing] = useState(false)

  return (
    <div
      className="contents"
      onKeyDownCapture={(evt) => {
        if (evt.key === 'Tab' || evt.key === 'ArrowUp' || evt.key === 'ArrowDown') viaKeyboard.current = true
      }}
      onPointerDownCapture={() => {
        viaKeyboard.current = false
      }}>
      <label
        className={cn(
          'mb-1 flex h-9 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 text-zinc-500',
          searchRing && 'border-primary-400 ring-2 ring-primary-400/35 ring-offset-2 ring-offset-(--focus-gap)'
        )}>
        <Icon icon={MagnifyingGlassIcon} size={16} />
        <input
          ref={searchRef}
          data-row
          value={query}
          onFocus={() => setSearchRing(viaKeyboard.current)}
          onBlur={() => setSearchRing(false)}
          onChange={(evt) => setQuery(evt.target.value)}
          placeholder="Find a board…"
          aria-label="Find a board"
          className="h-full min-w-0 flex-1 bg-transparent text-zinc-50 outline-none placeholder:text-zinc-500"
        />
      </label>

      {/* The scroll area runs into the popup's right padding, so its scrollbar sits in that gutter, clear of the rows. */}
      <ScrollArea.Root className="relative -mr-1.5">
        <ScrollArea.Viewport className="max-h-80 overscroll-contain scroll-fade-y outline-none">
          <ScrollArea.Content className="flex flex-col gap-0.5 pr-1.5">
            {boardsStatus === 'pending' && <p className="px-2.5 py-2 text-zinc-500">Loading boards…</p>}
            {boardsStatus === 'error' && <p className="px-2.5 py-2 text-zinc-500">Couldn't load your boards.</p>}

            {favorites.length > 0 && <SectionLabel>Favorites</SectionLabel>}
            {favorites.map((b) => (
              <BoardRow key={b.id} board={b} current={b.id === board.id} onSelect={open} />
            ))}

            {others.length > 0 && favorites.length > 0 && <SectionLabel>All boards</SectionLabel>}
            {others.map((b) => (
              <BoardRow key={b.id} board={b} current={b.id === board.id} onSelect={open} />
            ))}

            {boardsStatus === 'success' && !favorites.length && !others.length && (
              <p className="px-2.5 py-2 text-zinc-500">No boards match “{query.trim()}”.</p>
            )}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        {/* Thin and faint; it brightens while the pointer is over the list or it's scrolling. */}
        <ScrollArea.Scrollbar className="my-1 mr-px flex w-1 justify-center opacity-40 transition-opacity duration-150 data-hovering:opacity-100 data-scrolling:opacity-100">
          <ScrollArea.Thumb className="w-full rounded-full bg-white/25" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <div className="mx-1 my-1 border-t border-white/8" />

      <button
        data-row
        type="button"
        onClick={handleNewBoard}
        className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 font-semibold text-primary-300 outline-none hover:bg-white/6 focus-visible:bg-white/6 focus-visible:inset-ring-2 focus-visible:inset-ring-sky-400">
        <Icon icon={PlusIcon} size={16} />
        New board
      </button>
    </div>
  )
}

const SectionLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="px-2.5 pt-2 pb-1 text-xs font-bold tracking-wider text-zinc-500 uppercase">{children}</div>
)

interface BoardRowProps {
  board: BoardSummary
  current: boolean
  onSelect: (id: string) => void
}

const BoardRow: React.FC<BoardRowProps> = ({ board, current, onSelect }) => (
  <button
    data-row
    type="button"
    aria-current={current || undefined}
    onClick={() => onSelect(board.id)}
    className={cn(
      'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-zinc-200 outline-none',
      // In a list, the ring sits inside the row.
      'hover:bg-white/6 focus-visible:bg-white/6 focus-visible:inset-ring-2 focus-visible:inset-ring-sky-400',
      current && 'bg-primary-500/15 hover:bg-primary-500/20 focus-visible:bg-primary-500/20'
    )}>
    <span className="w-3.5 shrink-0 text-primary-300">{current && <Icon icon={CheckIcon} size={14} />}</span>
    <span className="min-w-0 flex-1 truncate">{board.name}</span>
    <span className="shrink-0 text-xs text-zinc-500">
      {board.heroes_count} {board.heroes_count === 1 ? 'hero' : 'heroes'}
    </span>
    {board.is_favorite && (
      <span className="shrink-0 text-yellow-500">
        <Icon icon={StarIcon} size={14} />
      </span>
    )}
  </button>
)

/** Whether the element's text overflows it: measured on mount and whenever the text changes. */
function useIsTruncated(ref: React.RefObject<HTMLElement | null>, text: string) {
  const [isTruncated, setIsTruncated] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setIsTruncated(el.scrollWidth > el.clientWidth + 1)
    measure()
    // The web font can land after the first measure and change the width.
    void document.fonts?.ready.then(measure)
  }, [ref, text])

  return isTruncated
}

export { BoardToolbarSwitcher }
