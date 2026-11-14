import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { type Board, type Category, type ID } from '~/src/types/api'
import { ORDER_BUFFER } from '~/src/contexts/board-list/constants'
import { type ResolvedStart } from '../starts/start'

interface CreateBoardVariables {
  name: string
  categories: Array<
    Omit<Category, 'id' | 'heroes' | 'created_at' | 'updated_at'> & {
      // `id` is the hero's
      heroes: { id: ID; order: number }[]
    }
  >
}

/**
 * Create an "Untitled" board laid out by a start. Takes the whole start, so the mutation's variables say which one
 * is saving. Resolves to the new board, categories and all, and caches it, so /b/:id opens without fetching it.
 */
const useCreateBoardMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (start: ResolvedStart) => {
      const body: CreateBoardVariables = {
        name: 'Untitled',
        // A start holds whole heroes (the previews show them); the API takes ids and an order.
        categories: start.categories.map(({ heroes, ...category }) => ({
          ...category,
          heroes: heroes.map((hero, i) => ({ id: hero.id, order: (i + 1) * ORDER_BUFFER }))
        }))
      }
      const response = await http<{ board: Board }>('boards', { method: 'POST', body })
      return response.board
    },
    onSuccess: (board) => {
      queryClient.setQueryData(boardKeys.detail(board.id), board)
      return queryClient.invalidateQueries({ queryKey: boardKeys.list() })
    }
  })
}

export { useCreateBoardMutation }
