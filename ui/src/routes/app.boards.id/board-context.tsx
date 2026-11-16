import React, { createContext, useCallback, useContext, useState } from 'react'
import { produce, type Draft } from 'immer'
import { Link, Navigate, useLocation } from 'react-router'
import { Container } from '~/src/components/container/container'
import { ErrorState } from '~/src/components/error-state/error-state'
import { PageSpinner } from '~/src/components/page-spinner/page-spinner'
import { Spacer } from '~/src/components/spacer/spacer'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { useLatestValue } from '~/src/hooks/use-latest-value'
import { HttpError } from '~/src/lib/api/http'
import { type Board, type Slug } from '~/src/types/api'
import { useBoardQuery } from './queries/use-board-query'

interface BoardContextType {
  /** The board as shown: the draft while a drag or resize is in progress, otherwise the cached board. */
  board: Board
  /** Change the board as shown, without saving, while a drag or resize is in progress. The first call copies the cached board. */
  updateDraft: (recipe: (board: Draft<Board>) => void) => void
  /** Drop the draft: right after calling the mutation that saves it, or alone to cancel. */
  clearDraft: () => void
}

const BoardContext = createContext<BoardContextType | null>(null)

interface Props {
  boardSlug: Slug
}

/** Loads the board (with pending and error states) and holds the drag/resize draft shown in its place. */
const BoardProvider: React.FC<React.PropsWithChildren<Props>> = ({ boardSlug, children }) => {
  // The query and the draft live in the same component on purpose. Clearing the draft right after mutate()
  // re-renders this component, which then reads the cache fresh, already holding the mutation's change. Passing
  // the board in as a prop instead would show the old position for a frame.
  const { data: savedBoard, status, error, refetch, isFetching } = useBoardQuery(boardSlug)

  const { user } = useAuthUser()

  const location = useLocation()

  const [draft, setDraft] = useState<Board | null>(null)

  const savedBoardRef = useLatestValue(savedBoard)

  const updateDraft = useCallback(
    (recipe: (board: Draft<Board>) => void) =>
      setDraft((current) => {
        const base = current ?? savedBoardRef.current
        return base ? produce(base, recipe) : current
      }),
    [savedBoardRef]
  )

  const clearDraft = useCallback(() => setDraft(null), [])

  const board = draft ?? savedBoard

  if (status === 'pending') {
    return <PageSpinner />
  }

  // The API says 404 for a board that doesn't exist and for one that's private and not theirs, alike.
  if (status === 'error' && error instanceof HttpError && error.status === 404) {
    // Signed out, it may be their own board: log in, then come back here.
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    return (
      <Container>
        <div role="alert" className="mx-auto max-w-90 py-12 text-center">
          <p>This board is private or doesn't exist.</p>
          <Spacer size={2} />
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-lg bg-primary-500 px-4 font-semibold focus-visible:ring-focus">
            Go to your boards
          </Link>
        </div>
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container>
        <ErrorState
          className="py-12"
          message="Couldn't load this board. Check your connection and try again."
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </Container>
    )
  }

  if (!board) return null

  return <BoardContext.Provider value={{ board, updateDraft, clearDraft }}>{children}</BoardContext.Provider>
}

const useBoard = () => {
  const context = useContext(BoardContext)
  if (!context) throw new Error('useBoard must be used inside BoardProvider')
  return context
}

export { BoardProvider, useBoard }
