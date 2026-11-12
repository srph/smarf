import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '~/src/contexts/query/query-provider'
import { Board } from '~/src/types/api'
import { BoardOperationProps } from './types'

interface UpdateBoardMutationResponse {
  board: Board
}

interface UpdateBoardMutationVariables {
  name: string
}

const useUpdateBoardMutation = ({
  boardId,
  boardKey,
  getBoard,
  setBoard,
  rollback,
  setIsEditing
}: BoardOperationProps) => {
  const queryClient = useQueryClient()

  return useMutation<UpdateBoardMutationResponse, UpdateBoardMutationVariables>(`/boards/${boardId}`, 'put', {
    mutationKey: boardKey,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ['/boards'] })

      setBoard({
        ...getBoard(),
        name: data.board.name
      })

      setIsEditing(false)
    },
    onError: rollback
  })
}

export { useUpdateBoardMutation, type UpdateBoardMutationVariables }
