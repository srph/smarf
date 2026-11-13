import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type Board, type ID } from '~/src/types/api'
import { getCategoryHeight } from '~/src/contexts/board-list/utils'
import { type HeroPosition } from './use-move-hero-mutation'

interface RemoveHeroVariables {
  category_id: ID
  hero_pivot_id: ID
  category_height: number
}

/** Removing the hero at `at` on `board`: which entry, and the category's height without it. Null if either is gone. */
const removeHeroVariables = (board: Board, at: HeroPosition): RemoveHeroVariables | null => {
  const category = board.categories.find((c) => c.id === at.container)
  const hero = category?.heroes[at.index]
  if (!category || !hero) return null

  return {
    category_id: category.id,
    hero_pivot_id: hero.pivot.id,
    category_height: getCategoryHeight({ categoryWidth: category.width, heroCount: category.heroes.length - 1 })
  }
}

/** Remove one hero from a category (variables from `removeHeroVariables`). It goes right away. */
const useRemoveHeroMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ category_id, hero_pivot_id, category_height }: RemoveHeroVariables) =>
      http(`categories/${category_id}/heroes/${hero_pivot_id}`, { method: 'DELETE', body: { category_height } }),
    onMutate: ({ category_id, hero_pivot_id, category_height }) =>
      update((board) => {
        const category = board.categories.find((c) => c.id === category_id)
        if (!category) return
        category.heroes = category.heroes.filter((h) => h.pivot.id !== hero_pivot_id)
        category.height = category_height
      })
  })
}

export { useRemoveHeroMutation, removeHeroVariables }
