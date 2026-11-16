import React from 'react'
import { BoardDotGrid } from '~/src/components/board-dot-grid/board-dot-grid'
import { Container } from '~/src/components/container/container'
import { PageTitle } from '~/src/components/page-title/page-title'
import { CATEGORY_SPACING } from '~/src/contexts/board-list/constants'
import { getLowestCategoryBottom } from '~/src/contexts/board-list/utils'
import { useBoard } from './board-context'
import { BoardVisitorCategory } from './board-visitor-category'
import { BoardVisitorDock } from './board-visitor-dock'

/**
 * Someone else's public board, read-only: the categories under the navigation, and a dock at the bottom (whose board,
 * view only, Share and Copy) where the owner's toolbar would be. The same for a visitor signed in or out.
 */
const BoardVisitorView: React.FC = () => {
  const { board } = useBoard()

  return (
    <>
      <PageTitle title={`${board.name} Board`} />

      {/* Clips the dots sideways, like the workspace. */}
      <div className="overflow-x-clip">
        <Container>
          <BoardDotGrid height={getLowestCategoryBottom(board) + CATEGORY_SPACING}>
            {board.categories.map((category) => (
              <BoardVisitorCategory key={category.id} category={category} />
            ))}
          </BoardDotGrid>
          <div className="pointer-events-none h-100" />
        </Container>
      </div>

      <BoardVisitorDock />
    </>
  )
}

export { BoardVisitorView }
