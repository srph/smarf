import React, { useEffect } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { Container } from '~/src/components/container/container'
import { Icon } from '~/src/components/icon/icon'
import { Spinner } from '~/src/components/spinner/spinner'
import { useBoard } from '~/src/routes/app.boards.id/board-context'
import { useBoardSaveStatus } from './queries/use-board-save-status'
import { useDelayedState } from '~/src/hooks/use-delayed-state'

type Status = 'loading' | 'saved' | 'error'

const BoardToolbarStatusIndicator = () => {
  const { board } = useBoard()

  const saveStatus = useBoardSaveStatus(board.id)

  const [status, setStatus] = useDelayedState<Status>(
    'saved',
    (previous) => {
      return previous === 'loading'
    },
    1000
  )

  useEffect(() => {
    setStatus(saveStatus === 'saving' ? 'loading' : saveStatus)
  }, [saveStatus, setStatus])

  return (
    <Container>
      <div className="mb-4 flex">
        {status === 'saved' && (
          <div className="ml-auto flex items-center text-xs">
            <div className="mr-2 text-green-500">
              <Icon icon={CheckCircleIcon} />
            </div>
            Saved
          </div>
        )}

        {status === 'error' && (
          <div className="ml-auto flex items-center text-xs">
            <div className="mr-2 text-red-500">
              <Icon icon={ExclamationCircleIcon} />
            </div>
            Couldn't save. Change undone.
          </div>
        )}

        {status === 'loading' && (
          <div className="ml-auto flex items-center text-xs">
            <div className="mr-2 text-green-500">
              <Spinner />
            </div>
            Updating
          </div>
        )}
      </div>
    </Container>
  )
}

export { BoardToolbarStatusIndicator }
