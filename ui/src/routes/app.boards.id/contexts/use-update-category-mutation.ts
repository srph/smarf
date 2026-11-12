import { produce } from 'immer'
import { useMutation } from '~/src/contexts/query/query-provider'
import { ID } from '~/src/types/api'
import { BoardOperationProps, BoardOperation } from './types'

interface UpdateCategoryMutationVariables {
  id: ID
  name: string
}

type MutationReturnType = BoardOperation<(v: UpdateCategoryMutationVariables) => void>

const useUpdateCategoryMutation = ({
  boardKey,
  getBoard,
  setBoard,
  rollback
}: BoardOperationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<{}, UpdateCategoryMutationVariables>(
    (v) => `/categories/${v.id}`,
    'put',
    {
      mutationKey: boardKey,
      onError: rollback
    }
  )

  const mutate = (v: UpdateCategoryMutationVariables) => {
    setBoard(
      produce(getBoard(), (draft) => {
        const category = draft.categories.find((c) => c.id === v.id)
        if (category) category.name = v.name
      })
    )

    mutateFn(v)
  }

  return {
    mutate,
    ...props
  }
}

export { useUpdateCategoryMutation, type UpdateCategoryMutationVariables }
