import React from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { Spinner } from '~/src/components/spinner/spinner'
import { useBoard } from './board-context'
import { useAddCategoryMutation, newCategory } from './mutations/use-add-category-mutation'
import { BoardToolbarTooltip } from './board-toolbar-tooltip'
import { MetalButton } from './metal-button'

interface Props {
  // While the board is being renamed or deleted: stays in place, turns graphite, and ignores clicks.
  locked: boolean
}

/** The toolbar's primary action, in its own pill beside the dock. */
const BoardToolbarAddCategoryButton: React.FC<Props> = ({ locked }) => {
  const { board } = useBoard()

  const { mutate: addCategory, isPending } = useAddCategoryMutation(board.id)

  return (
    <BoardToolbarTooltip label="Finish editing the board first" disabled={!locked}>
      <MetalButton
        size="lg"
        shine
        // Stays "New category" while the label reads Adding…, so the button keeps one name.
        aria-label="New category"
        disabled={locked}
        busy={isPending}
        onClick={() => addCategory(newCategory(board))}>
        {isPending ? <Spinner /> : <Icon icon={PlusIcon} />}
        {isPending ? 'Adding…' : 'New category'}
      </MetalButton>
    </BoardToolbarTooltip>
  )
}

export { BoardToolbarAddCategoryButton }
