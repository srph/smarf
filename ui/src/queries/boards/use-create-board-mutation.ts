import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { heroesQueryOptions } from '~/src/queries/heroes/use-heroes-query'
import { type Board, type Category, type Hero, type HeroCategoryPivot } from '~/src/types/api'
import { CATEGORY_BODY_INITIAL_WIDTH, CATEGORY_SPACING, ORDER_BUFFER } from '~/src/contexts/board-list/constants'
import { getCategoryHeight } from '~/src/contexts/board-list/utils'
import { boardKeys } from './board-keys'

interface CreateBoardVariables {
  name: string
  categories: Array<
    Omit<Category, 'id' | 'heroes' | 'created_at' | 'updated_at'> & {
      heroes: HeroCategoryPivot['pivot'][]
    }
  >
}

/** Create an "Untitled" board with two starter categories, each holding the first two heroes. Resolves to the new board. */
const useCreateBoardMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: boardKeys.create(),
    mutationFn: async () => {
      const heroes = await queryClient.ensureQueryData(heroesQueryOptions())
      const response = await http<{ board: Board }>('boards', { method: 'POST', body: starterBoard(heroes) })
      return response.board
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.list() })
  })
}

/** True while any board is being created, so every "new board" button can show it, not just the one clicked. */
const useIsBoardCreating = () => useIsMutating({ mutationKey: boardKeys.create() }) > 0

function starterBoard(heroes: Hero[]): CreateBoardVariables {
  const initialHeroes = heroes.slice(0, 2).map((hero, i) => ({ id: hero.id, order: (i + 1) * ORDER_BUFFER }))

  const height = getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: initialHeroes.length })

  const category = (name: string, y_position: number) => ({
    name,
    heroes: initialHeroes,
    x_position: 0,
    y_position,
    width: CATEGORY_BODY_INITIAL_WIDTH,
    height
  })

  return {
    name: 'Untitled',
    categories: [category('Mid Farming', 0), category('Suntukan Offlane', height + CATEGORY_SPACING)]
  }
}

export { useCreateBoardMutation, useIsBoardCreating }
