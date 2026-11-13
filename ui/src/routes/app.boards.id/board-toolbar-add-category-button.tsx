import React from 'react'
import { cn } from 'cn'
import { PlusIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { Spinner } from '~/src/components/spinner/spinner'
import { useBoard } from './board-context'
import { useAddCategoryMutation, newCategory } from './mutations/use-add-category-mutation'
import { BoardToolbarTooltip } from './board-toolbar-tooltip'

interface Props {
  // While the board is being renamed or deleted: stays in place, turns graphite, and ignores clicks.
  locked: boolean
}

// Feeds bg-cursor-light, so the highlight follows the pointer.
const handlePointerMove = (evt: React.PointerEvent<HTMLButtonElement>) => {
  const rect = evt.currentTarget.getBoundingClientRect()
  evt.currentTarget.style.setProperty('--x', `${evt.clientX - rect.left}px`)
  evt.currentTarget.style.setProperty('--y', `${evt.clientY - rect.top}px`)
}

/** The toolbar's primary action, in its own pill beside the dock. */
const BoardToolbarAddCategoryButton: React.FC<Props> = ({ locked }) => {
  const { board } = useBoard()

  const { mutate: addCategory, isPending } = useAddCategoryMutation(board.id)

  const handleClick = () => {
    if (locked || isPending) return
    addCategory(newCategory(board))
  }

  return (
    <BoardToolbarTooltip label="Finish editing the board first" disabled={!locked}>
      <button
        type="button"
        // Stays "New category" while the label reads Adding…, so the button keeps one name.
        aria-label="New category"
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        // aria-disabled, not disabled: the button keeps its hover, so its tooltip can say why.
        aria-disabled={locked || undefined}
        aria-busy={isPending || undefined}
        className={cn(
          'group relative flex h-11.5 shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-xl border pr-5 pl-4 font-bold',
          'border-primary-200/40 bg-indigo-metal text-white shadow-lg inset-shadow-xs shadow-primary-500/45 inset-shadow-white/50 text-shadow-primary-950/50 text-shadow-xs',
          'transition-[filter,translate,scale,color,border-color,box-shadow] duration-250 hover:brightness-110 active:translate-y-px active:scale-99',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
          isPending && 'cursor-progress brightness-90 saturate-75 hover:brightness-90',
          // Graphite: the indigo stops at the padding edge, so the border shows the board, not indigo.
          'aria-disabled:cursor-not-allowed aria-disabled:border-white/17 aria-disabled:bg-clip-padding aria-disabled:text-zinc-400 aria-disabled:shadow-black/90 aria-disabled:inset-shadow-white/30 aria-disabled:text-shadow-black/55',
          'aria-disabled:hover:brightness-100 aria-disabled:active:translate-y-0 aria-disabled:active:scale-100'
        )}>
        {/* Graphite, faded in over the indigo while locked. */}
        <span className="absolute inset-0 bg-graphite-metal opacity-0 transition-opacity duration-250 group-aria-disabled:opacity-100" />
        {/* Hover: a soft light under the cursor, and a sheen that sweeps across once. */}
        <span className="pointer-events-none absolute inset-0 bg-cursor-light opacity-0 transition-opacity duration-250 group-hover:opacity-100 group-aria-disabled:hidden" />
        <span className="pointer-events-none absolute -inset-y-3 left-0 w-2/5 bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:animate-toolbar-sheen group-aria-disabled:hidden" />

        <span className="relative">{isPending ? <Spinner /> : <Icon icon={PlusIcon} />}</span>
        <span className="relative">{isPending ? 'Adding…' : 'New category'}</span>
      </button>
    </BoardToolbarTooltip>
  )
}

export { BoardToolbarAddCategoryButton }
