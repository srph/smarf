import React, { useEffect } from 'react'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { Container } from '~/src/components/container/container'
import { Icon } from '~/src/components/icon/icon'
import { Spinner } from '~/src/components/spinner/spinner'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts/board-workspace-context'
import { useDelayedState } from '~/src/hooks/use-delayed-state'

type Status = 'loading' | 'saved' | 'error'

const ToolbarStatusIndicator = () => {
  const { isSaving } = useBoardWorkspace()

  const [status, setStatus] = useDelayedState<Status>(
    'saved',
    (previous) => {
      return previous === 'loading'
    },
    1000
  )

  useEffect(() => {
    setStatus(isSaving ? 'loading' : 'saved')
  }, [isSaving, setStatus])

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

export { ToolbarStatusIndicator }
