import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '~/src/contexts/query/query-provider'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { BoardOperationProps } from './types'

const useDeleteBoardMutation = ({ boardId, boardKey }: BoardOperationProps) => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  return useMutation<{}, void>(`/boards/${boardId}`, 'delete', {
    mutationKey: boardKey,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: boardKeys.list() })
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
