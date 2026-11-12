import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '~/src/contexts/Query'
import { BoardOperationProps, CustomMutationReturnType } from './types'

interface FavoriteBoardMutationVariables {
  is_favorite: boolean
}

type MutationReturnType = CustomMutationReturnType<() => void>

const useFavoriteBoardMutation = ({
  boardId,
  boardKey,
  getBoard,
  setBoard,
  rollback
}: BoardOperationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  const { mutate: mutateFn, ...props } = useMutation<{}, FavoriteBoardMutationVariables>(
    `/boards/${boardId}/favorite`,
    'put',
    {
      mutationKey: boardKey,
      onSuccess: () => {
        // @TODO: Toast
        queryClient.invalidateQueries({ queryKey: ['/boards'] })
      },
      onError: rollback
    }
  )

  const mutate = () => {
    const board = getBoard()
    const is_favorite = !board.is_favorite

    setBoard({ ...board, is_favorite })

    mutateFn({ is_favorite })
  }

  return {
    mutate,
    ...props
  }
}

export { useFavoriteBoardMutation, type FavoriteBoardMutationVariables }
