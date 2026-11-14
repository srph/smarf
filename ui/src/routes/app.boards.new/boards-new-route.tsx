import React, { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { cn } from 'cn'
import { useNavigate } from 'react-router'
import { useReducedMotion } from 'motion/react'
import { BoardDotGrid } from '~/src/components/board-dot-grid/board-dot-grid'
import { Container } from '~/src/components/container/container'
import { ErrorState } from '~/src/components/error-state/error-state'
import { PageSpinner } from '~/src/components/page-spinner/page-spinner'
import { PageTitle } from '~/src/components/page-title/page-title'
import { useHeroesQuery } from '~/src/queries/heroes/use-heroes-query'
import { BOARD_WORKSPACE_ALLOWANCE } from '~/src/contexts/board-list/constants'
import { type NewBoardHandoffState } from '~/src/routes/app.boards.id/use-new-board-handoff'
import { useCreateBoardMutation } from './mutations/use-create-board-mutation'
import { StartCategoryCard } from './start-category-card'
import { FOLD_MS, StartTray, type TrayPhase } from './start-tray'
import { type ResolvedStart, type Start, resolveStart, startCategoryBottom } from './starts/start'
import { STARTS } from './starts/starts'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * /b/new: a board that doesn't exist yet. The tray of starts takes the toolbar's place, and hovering one shows it,
 * faded, where it will land. Nothing is saved until a start is chosen. Then the tray folds into a "Creating …" bar
 * and the start turns solid while the board saves; once both are done, the board opens in this page's place and its
 * dock slides in from the bar. If the save fails, the tray comes back to choose again.
 */
const BoardsNewRoute: React.FC = () => {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { data: heroes, status: heroesStatus, refetch: refetchHeroes, isFetching: isHeroesFetching } = useHeroesQuery()
  const { mutateAsync: createBoard, status: createStatus, variables: chosen } = useCreateBoardMutation()
  const [hovered, setHovered] = useState<Start['id'] | null>(null)
  const [folded, setFolded] = useState(false)

  // 'success' stays 'saving': the board is about to open in this page's place.
  const phase: TrayPhase = createStatus === 'idle' ? 'choosing' : createStatus === 'error' ? 'failed' : 'saving'

  // Set once /b/new unmounts, so a save that finishes after they've left doesn't pull them back.
  const leftRef = useRef(false)
  useEffect(() => {
    leftRef.current = false
    return () => {
      leftRef.current = true
    }
  }, [])

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

  const choose = async (start: ResolvedStart) => {
    setHovered(null)
    try {
      // Waits for the fold too, so the dock picks the bar up at rest, not mid-fold.
      const [board] = await Promise.all([createBoard(start), wait(reduceMotion ? 0 : FOLD_MS)])
      if (leftRef.current) return

      // The bar takes the dock's layoutId in a render of its own, before this page goes: the dock on /b/:id then
      // slides in from it.
      flushSync(() => setFolded(true))
      const state: NewBoardHandoffState = { newBoard: { start: start.name } }
      // replace: Back from the new board goes where New Board was clicked, not to /b/new
      navigate(`/b/${board.id}`, { replace: true, state })
    } catch {
      // The tray shows the failure (phase 'failed'), and every start can be chosen again.
    }
  }

  // The chosen start while it saves or after it fails; otherwise the hovered one
  const shownId = phase === 'choosing' || hovered ? hovered : chosen?.id
  const shown = starts.find((start) => start.id === shownId)

  // Room for the tallest start, so the page doesn't change height from one to the next
  const height = Math.max(0, ...starts.flatMap((start) => start.categories.map(startCategoryBottom)))

  return (
    <div className="overflow-x-clip">
      <Container>
        <PageTitle title="New Board" />
        <BoardDotGrid height={height + BOARD_WORKSPACE_ALLOWANCE}>
          {shown && (
            <div
              aria-hidden="true"
              // Solid while it saves: the board's own cards then open in the same places, so the change of page
              // doesn't show.
              className={cn(
                'pointer-events-none transition-opacity duration-300',
                phase === 'saving' ? 'opacity-100' : 'opacity-60'
              )}>
              {shown.categories.map((category) => (
                <StartCategoryCard key={category.name} category={category} variant="ghost" />
              ))}
            </div>
          )}
        </BoardDotGrid>
        <div className="pointer-events-none h-100" />
      </Container>

      <StartTray phase={phase} chosen={chosen} folded={folded} starts={starts} onHover={setHovered} onChoose={choose} />
    </div>
  )
}

export { BoardsNewRoute }
