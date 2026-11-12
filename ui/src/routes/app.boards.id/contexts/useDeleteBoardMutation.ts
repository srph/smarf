import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { BoardOperationProps } from './types'

const useDeleteBoardMutation = ({ boardId, boardKey }: BoardOperationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  return useMutation<{}, null>(`/boards/${boardId}`, 'delete', {
    mutationKey: boardKey,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['/boards'] })
      queryClient.removeQueries({ queryKey: boardKey })

      navigate('/')

      // @TODO: Toast
    },
    onError() {
      // @TODO: Toast
    }
  })
}

export { useDeleteBoardMutation }
