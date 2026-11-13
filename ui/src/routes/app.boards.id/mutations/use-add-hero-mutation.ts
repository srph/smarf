import { useMutation } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { last } from '~/src/utils'
import { type Category, type Hero, type HeroCategoryPivot, type ID } from '~/src/types/api'
import { ORDER_FIRST_BUFFER, ORDER_LAST_BUFFER } from '~/src/contexts/board-list/constants'
import { getCategoryHeight } from '~/src/contexts/board-list/utils'

interface AddHeroVariables {
  /** Shown in the category until the server answers. */
  hero: Hero
  category_id: ID
  /** Temporary pivot id until the server saves it. */
  hero_buffer_id: ID
  hero_order: number
  category_height: number
}

/** Adding `hero` to the end of `category`: its order, a temporary pivot id, and the category's new height. */
const addHeroVariables = (category: Category, hero: Hero): AddHeroVariables => ({
  hero,
  category_id: category.id,
  hero_buffer_id: uuid(),
  // @TODO: Use getHeroOrder utility
  hero_order: category.heroes.length ? last(category.heroes).pivot.order + ORDER_LAST_BUFFER : ORDER_FIRST_BUFFER,
  category_height: getCategoryHeight({ categoryWidth: category.width, heroCount: category.heroes.length + 1 })
})

/** Add a hero to a category (variables from `addHeroVariables`). It shows right away. */
const useAddHeroMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ hero, ...variables }: AddHeroVariables) =>
      http<{ hero: HeroCategoryPivot }>(`categories/${variables.category_id}/heroes`, {
        method: 'POST',
        body: { hero_id: hero.id, ...variables }
      }),
    onMutate: ({ hero, category_id, hero_buffer_id, hero_order, category_height }) =>
      update((board) => {
        const category = board.categories.find((c) => c.id === category_id)
        if (!category) return
        category.heroes.push({ ...hero, pivot: { id: hero_buffer_id, order: hero_order } })
        category.height = category_height
      }),
    // Swap the temporary pivot for the saved one; moving the hero later needs the real id.
    onSuccess: (data, { category_id, hero_buffer_id }) =>
      update((board) => {
        const category = board.categories.find((c) => c.id === category_id)
        const hero = category?.heroes.find((h) => h.pivot.id === hero_buffer_id)
        if (hero) hero.pivot = data.hero.pivot
      })
  })
}

export { useAddHeroMutation, addHeroVariables }
