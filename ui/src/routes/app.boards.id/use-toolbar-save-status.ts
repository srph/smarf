import { useEffect } from 'react'
import { useDelayedState } from '~/src/hooks/use-delayed-state'
import { type ID } from '~/src/types/api'
import { useBoardSaveStatus, type BoardSaveStatus } from './queries/use-board-save-status'

type ToolbarSaveStatus = BoardSaveStatus

/** The board's save status for the toolbar. Holds "saving" for a second after it ends, so quick saves don't flicker. */
const useToolbarSaveStatus = (boardId: ID): ToolbarSaveStatus => {
  const saveStatus = useBoardSaveStatus(boardId)

  const [status, setStatus] = useDelayedState<ToolbarSaveStatus>('saved', (previous) => previous === 'saving', 1000)

  useEffect(() => {
    setStatus(saveStatus)
  }, [saveStatus, setStatus])

  return status
}

export { useToolbarSaveStatus, type ToolbarSaveStatus }
