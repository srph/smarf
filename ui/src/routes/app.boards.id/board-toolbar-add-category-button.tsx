import React from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { useBoard } from './board-context'
import { useAddCategoryMutation, newCategory } from './mutations/use-add-category-mutation'
import { BoardToolbarTooltip } from './board-toolbar-tooltip'
import { MetalButton } from './metal-button'

interface Props {
  // While the board is being renamed or deleted: stays in place, turns graphite, and ignores clicks.
  locked: boolean
}

/**
 * The toolbar's primary action, in its own pill beside the dock. No pending state: the category shows on the
 * board right away, and saves queue in order, so the button stays ready for the next click.
 */
const BoardToolbarAddCategoryButton: React.FC<Props> = ({ locked }) => {
  const { board } = useBoard()

  const { mutate: addCategory } = useAddCategoryMutation(board.id)

  return (
    <BoardToolbarTooltip label="Finish editing the board first" disabled={!locked}>
      <MetalButton size="lg" shine disabled={locked} onClick={() => addCategory(newCategory(board))}>
        <Icon icon={PlusIcon} />
        New category
      </MetalButton>
    </BoardToolbarTooltip>
  )
}

export { BoardToolbarAddCategoryButton }
