import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { BoardDotGrid } from '~/src/components/board-dot-grid/board-dot-grid'
import { Container } from '~/src/components/container/container'
import { ErrorState } from '~/src/components/error-state/error-state'
import { PageSpinner } from '~/src/components/page-spinner/page-spinner'
import { PageTitle } from '~/src/components/page-title/page-title'
import { useHeroesQuery } from '~/src/queries/heroes/use-heroes-query'
import { BOARD_WORKSPACE_ALLOWANCE } from '~/src/contexts/board-list/constants'
import { useCreateBoardMutation } from './mutations/use-create-board-mutation'
import { StartCategoryCard } from './start-category-card'
import { StartTray } from './start-tray'
import { type ResolvedStart, type Start, resolveStart, startCategoryBottom } from './starts/start'
import { STARTS } from './starts/starts'

/**
 * /b/new: a board that doesn't exist yet. The tray of starts takes the toolbar's place, and hovering one shows it,
 * faded, where it will land. Nothing is saved until a start is chosen; then the board is created with that start's
 * categories and opens in this page's place.
 */
const BoardsNewRoute: React.FC = () => {
  const navigate = useNavigate()
  const { data: heroes, status: heroesStatus, refetch: refetchHeroes, isFetching: isHeroesFetching } = useHeroesQuery()
  const { mutate: createBoard, isPending: isCreating, variables: chosen } = useCreateBoardMutation()
  const [hovered, setHovered] = useState<Start['id'] | null>(null)

  // Each start laid out once per hero list
  const starts = useMemo(() => (heroes ? STARTS.map((start) => resolveStart(start, heroes)) : []), [heroes])

  if (heroesStatus === 'pending') return <PageSpinner />

  if (heroesStatus === 'error') {
    return (
      <Container>
        <PageTitle title="New Board" />
        <ErrorState
          className="py-12"
          message="Couldn't load the heroes. Check your connection and try again."
          onRetry={() => refetchHeroes()}
          isRetrying={isHeroesFetching}
        />
      </Container>
    )
  }

  const choose = (start: ResolvedStart) =>
    // replace: Back from the new board goes where New Board was clicked, not to /b/new
    createBoard(start, { onSuccess: (board) => navigate(`/b/${board.id}`, { replace: true }) })

  // The chosen start stays shown while it saves; until then, the hovered one
  const shown = starts.find((start) => start.id === (isCreating ? chosen?.id : hovered))

  // Room for the tallest start, so the page doesn't change height from one to the next
  const height = Math.max(0, ...starts.flatMap((start) => start.categories.map(startCategoryBottom)))

  return (
    <div className="overflow-x-clip">
      <Container>
        <PageTitle title="New Board" />
        <BoardDotGrid height={height + BOARD_WORKSPACE_ALLOWANCE}>
          {shown && (
            <div className="pointer-events-none opacity-60" aria-hidden="true">
              {shown.categories.map((category) => (
                <StartCategoryCard key={category.name} category={category} variant="ghost" />
              ))}
            </div>
          )}
        </BoardDotGrid>
        <div className="pointer-events-none h-100" />
      </Container>

      <StartTray starts={starts} saving={isCreating} onHover={setHovered} onChoose={choose} />
    </div>
  )
}

export { BoardsNewRoute }
