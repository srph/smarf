import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { Board } from '~/src/types/api'
import { BoardOperationProps } from './types'

const useDuplicateBoardMutation = ({ boardId, boardKey }: BoardOperationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  return useMutation<{ board: Board }>(`/boards/${boardId}/duplicate`, 'post', {
    mutationKey: boardKey,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ['/boards'] })

      navigate(`/b/${data.board.id}`)
      // @TODO: Toast
    },
    onError() {
      // @TODO: Toast
    }
  })
}

export { useDuplicateBoardMutation }
