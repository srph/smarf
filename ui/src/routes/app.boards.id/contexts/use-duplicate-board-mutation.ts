import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '~/src/contexts/query/query-provider'
import { Board } from '~/src/types/api'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { BoardOperationProps } from './types'

const useDuplicateBoardMutation = ({ boardId, boardKey }: BoardOperationProps) => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  return useMutation<{ board: Board }, void>(`/boards/${boardId}/duplicate`, 'post', {
    mutationKey: boardKey,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: boardKeys.list() })

      navigate(`/b/${data.board.id}`)
      // @TODO: Toast
    },
    onError() {
      // @TODO: Toast
    }
  })
}

export { useDuplicateBoardMutation }
