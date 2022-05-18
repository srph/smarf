import immer from 'immer'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { Board, ID } from '~/src/types/api'
import { DivdedQueryAndMutationProps } from './types'

interface UpdateCategoryMutationVariables {
  id: ID
  name: string
}

interface UpdateCategoryMutationResponse {
  board: Board
}

const useUpdateCategoryMutation = ({
  board,
  boardRef,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): MutationReturnType => {
  return useMutation<UpdateCategoryMutationResponse, UpdateCategoryMutationVariables>(
    (v) => `/categories/${v.id}`,
    'put',
    {
      onSuccess(data, v) {
        // Silently apply so we have the correct uuid
        setBoard(
          immer(boardRef.current, (draft) => {
            const category = draft.categories.find((c) => c.id === v.id)
            if (!category) return // @TODO: Throw
            category.name = v.name
          })
        )
      },
      onError() {
        // @TODO: Rollback
      }
    }
  )
}

export { useUpdateCategoryMutation, UpdateCategoryMutationVariables }
