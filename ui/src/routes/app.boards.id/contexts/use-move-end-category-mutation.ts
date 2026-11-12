import { produce } from 'immer'
import { useMutation } from '~/src/contexts/query/query-provider'
import { Category, ID } from '~/src/types/api'
import { BoardOperationProps, BoardOperation } from './types'

interface MoveCategoryMutationVariables {
  category_id: ID
  x_position: number
  y_position: number
}

type MutationFn = (v: { container: Category }) => void

type MutationReturnType = BoardOperation<MutationFn>

/** On drop: write the dragged position to the cache, drop the draft, and save it. */
const useMoveEndCategoryMutation = ({
  boardKey,
  getBoard,
  setBoard,
  setDraft,
  rollback
}: BoardOperationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<{}, MoveCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}/move`,
    'put',
    {
      mutationKey: boardKey,
      onError: rollback
    }
  )

  // `container` comes from the rendered board, so it already has the dragged position.
  const mutate: MutationFn = ({ container }) => {
    setBoard(
      produce(getBoard(), (draft) => {
        const category = draft.categories.find((c) => c.id === container.id)
        if (!category) return
        category.x_position = container.x_position
        category.y_position = container.y_position
      })
    )
    setDraft(null)

    mutateFn({
      category_id: container.id,
      x_position: container.x_position,
      y_position: container.y_position
    })
  }

  return {
    mutate,
    ...props
  }
}

export { useMoveEndCategoryMutation, type MoveCategoryMutationVariables }
