import immer from 'immer'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { Category, ID } from '~/src/types/api'
import { DivdedQueryAndMutationProps, CustomMutationReturnType } from './types'

interface DeleteCategoryMutationVariables {
  category_id: ID
}

type MutationFn = (category: Category) => void

type MutationReturnType = CustomMutationReturnType<MutationFn>

const useDeleteCategoryMutation = ({
  board,
  boardRef,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<{}, DeleteCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}`,
    'delete',
    {
      onSuccess(data, v) {
        // @TODO: Toast
      },
      onError() {
        // @TODO: Rollback (?)
      }
    }
  )

  // @TODO: Turn into a reusable function that we may reuse this when
  // adding categories to a new board.
  const mutate = (category: Category) => {
    setBoard(
      immer(board, (draft) => {
        const categoryId = category.id
        draft.categories = draft.categories.filter((category) => category.id !== categoryId)
      })
    )

    mutateFn({ category_id: category.id })
  }

  return {
    mutate,
    ...props
  }
}

export { useDeleteCategoryMutation, DeleteCategoryMutationVariables }
