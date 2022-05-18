import { useMutation } from '~/src/contexts/Query'
import { Category, ID } from '~/src/types/api'
import { DivdedQueryAndMutationProps, CustomMutationReturnType } from './types'

interface MoveCategoryMutationVariables {
  category_id: ID
  x_position: number
  y_position: number
}

type MutationFn = (v: { container: Category }) => void

type MutationReturnType = CustomMutationReturnType<MutationFn>

const useMoveEndCategoryMutation = ({
  board,
  boardRef,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<{}, MoveCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}/move`,
    'put',
    {
      onSuccess() {
        // @TODO: Silently apply so we have the correct uuid
      },
      onError() {
        // @TODO: Rollback
      }
    }
  )

  // @TODO: Turn into a reusable function that we may reuse this when
  // adding categories to a new board.
  const mutate: MutationFn = ({ container }) => {
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

export { useMoveEndCategoryMutation, MoveCategoryMutationVariables }
