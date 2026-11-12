import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '~/src/contexts/query/query-provider'
import { BoardOperationProps } from './types'

const useDeleteBoardMutation = ({ boardId, boardKey }: BoardOperationProps) => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  return useMutation<{}, void>(`/boards/${boardId}`, 'delete', {
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
