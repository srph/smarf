import { useQueryClient } from '@tanstack/react-query'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { Board } from '~/src/types/api'
import { DivdedQueryAndMutationProps } from './types'

interface UpdateBoardMutationResponse {
  board: Board
}

interface UpdateBoardMutationVariables {
  name: string
}

const useUpdateBoardMutation = ({ board, setBoard, setIsEditing }: DivdedQueryAndMutationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  return useMutation<UpdateBoardMutationResponse, UpdateBoardMutationVariables>(`/boards/${board?.id}`, 'put', {
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ['/boards'] })

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
}

export { useUpdateBoardMutation, type UpdateBoardMutationVariables }
