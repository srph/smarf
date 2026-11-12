import { produce } from 'immer'
import { useMutation } from '~/src/contexts/query/query-provider'
import { Category, ID } from '~/src/types/api'
import { BoardOperationProps, BoardOperation } from './types'

interface DeleteCategoryMutationVariables {
  category_id: ID
}

type MutationFn = (category: Category) => void

type MutationReturnType = BoardOperation<MutationFn>

const useDeleteCategoryMutation = ({
  boardKey,
  getBoard,
  setBoard,
  rollback
}: BoardOperationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<{}, DeleteCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}`,
    'delete',
    {
      mutationKey: boardKey,
      onError: rollback
    }
  )

  const mutate = (category: Category) => {
    setBoard(
      produce(getBoard(), (draft) => {
        draft.categories = draft.categories.filter((c) => c.id !== category.id)
      })
    )

    mutateFn({ category_id: category.id })
  }

  return {
    mutate,
    ...props
  }
}

export { useDeleteCategoryMutation, type DeleteCategoryMutationVariables }
