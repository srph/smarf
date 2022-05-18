import immer from 'immer'
import { useQueryClient } from 'react-query'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { DivdedQueryAndMutationProps } from './types'

interface UpdateBoardMutationVariables {
  name: string
}

const useUpdateBoardMutation = ({ board, setBoard, setIsEditing }: DivdedQueryAndMutationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  const { mutate: mutateFn, ...props } = useMutation<UpdateBoardMutationVariables>(`/boards/${board?.id}`, 'put', {
    onSuccess(data) {
      queryClient.invalidateQueries('/boards')

      setBoard({
        ...board,
        name: data.board.name
      })

      setIsEditing(false)
    },

    onError() {
      // Toast
    }
  })

  const mutate = () => {
    const updatedFavoriteStatus = !board.is_favorite

    setBoard(
      immer(board, (draft) => {
        draft.is_favorite = updatedFavoriteStatus
      })
    )

    mutateFn({ is_favorite: updatedFavoriteStatus })
  }

  return {
    mutate,
    ...props
  }
}

export { useUpdateBoardMutation, UpdateBoardMutationVariables }
