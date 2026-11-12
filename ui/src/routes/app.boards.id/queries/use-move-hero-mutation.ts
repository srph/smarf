import { useMutation } from '@tanstack/react-query'
import { arrayMove } from '@dnd-kit/sortable'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type Board, type ID } from '~/src/types/api'
import { getCategoryHeight, getHeroOrder } from '~/src/contexts/board-list/utils'

/** A hero's place: which category, at which index. */
interface HeroPosition {
  container: ID
  index: number
}

interface MoveHeroVariables {
  hero_pivot_id: ID
  from_category_id: ID
  from_category_height: number
  to_category_id: ID
  to_category_height: number
  /** Where the hero lands in its new category. Not sent; the server sorts by `hero_order`. */
  to_index: number
  hero_order: number
}

/** Moving the hero at `from` to `to` on `board`: its new order and both categories' heights. Null if either is gone. */
const moveHeroVariables = (board: Board, from: HeroPosition, to: HeroPosition): MoveHeroVariables | null => {
  const fromCategory = board.categories.find((c) => c.id === from.container)
  const toCategory = board.categories.find((c) => c.id === to.container)
  const hero = fromCategory?.heroes[from.index]
  if (!fromCategory || !toCategory || !hero) return null

  const sameCategory = fromCategory.id === toCategory.id

  // The destination's heroes after the move, so the order can fit between the hero's new neighbours.
  const heroes = sameCategory
    ? arrayMove(toCategory.heroes, from.index, to.index)
    : toCategory.heroes.toSpliced(to.index, 0, hero)

  return {
    hero_pivot_id: hero.pivot.id,
    from_category_id: fromCategory.id,
    from_category_height: sameCategory
      ? fromCategory.height
      : getCategoryHeight({ categoryWidth: fromCategory.width, heroCount: fromCategory.heroes.length - 1 }),
    to_category_id: toCategory.id,
    to_category_height: sameCategory
      ? toCategory.height
      : getCategoryHeight({ categoryWidth: toCategory.width, heroCount: toCategory.heroes.length + 1 }),
    to_index: to.index,
    hero_order: getHeroOrder({ ...toCategory, heroes }, to.index)
  }
}

/** Reorder a hero or move it to another category (variables from `moveHeroVariables`). */
const useMoveHeroMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ to_index, ...variables }: MoveHeroVariables) =>
      http(`categories/${variables.from_category_id}/heroes/${variables.hero_pivot_id}`, {
        method: 'PUT',
        body: variables
      }),
    onMutate: (variables) =>
      update((board) => {
        const fromCategory = board.categories.find((c) => c.id === variables.from_category_id)
        const toCategory = board.categories.find((c) => c.id === variables.to_category_id)
        const index = fromCategory?.heroes.findIndex((h) => h.pivot.id === variables.hero_pivot_id) ?? -1
        if (!fromCategory || !toCategory || index === -1) return

        const [hero] = fromCategory.heroes.splice(index, 1)
        hero.pivot.order = variables.hero_order
        toCategory.heroes.splice(variables.to_index, 0, hero)
        fromCategory.height = variables.from_category_height
        toCategory.height = variables.to_category_height
      })
  })
}

export { useMoveHeroMutation, moveHeroVariables, type HeroPosition }
