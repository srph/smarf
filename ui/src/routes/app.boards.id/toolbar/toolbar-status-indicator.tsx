import React, { useEffect } from 'react'
import styled from 'styled-components'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { theme } from '~/src/theme'
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
      <StatusIndicatorContainer>
        {status === 'saved' && (
          <StatusIndicator>
            <StatusIndicatorIcon>
              <Icon icon={CheckCircleIcon} />
            </StatusIndicatorIcon>
            Saved
          </StatusIndicator>
        )}

        {status === 'loading' && (
          <StatusIndicator>
            <StatusIndicatorIcon>
              <Spinner />
            </StatusIndicatorIcon>
            Updating
          </StatusIndicator>
        )}
      </StatusIndicatorContainer>
    </Container>
  )
}

const StatusIndicatorContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`

const StatusIndicator = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: ${theme.fontSizes.sm}px;
`

const StatusIndicatorIcon = styled.div`
  margin-right: 8px;
  color: ${theme.colors.green[500]};
`

export { ToolbarStatusIndicator }
