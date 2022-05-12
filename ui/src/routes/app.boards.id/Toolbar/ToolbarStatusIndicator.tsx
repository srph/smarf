import React, { useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Container, Icon, Spinner } from '~/src/components'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts'
import { useDelayedState } from '~/src/hooks'

type Status = 'loading' | 'saved' | 'error'

const ToolbarStatusIndicator = () => {
  const {
    isUpdating,
    isDeleting,
    isAddingHero,
    isMovingHero,
    isAddingCategory,
    isMovingCategory,
    isResizingCategory,
    isDeletingCategory
  } = useBoardWorkspace()

  const [status, setStatus] = useDelayedState<Status>(
    'saved',
    (previous) => {
      return previous === 'loading'
    },
    1000
  )

  useEffect(() => {
    // @TODO: Seems to stop working after being idle.
    // Might be related to react-query or useDelayedState, check eitherway.
    console.log('Effect')

    if (
      isUpdating ||
      isDeleting ||
      isAddingHero ||
      isMovingHero ||
      isAddingCategory ||
      isMovingCategory ||
      isResizingCategory ||
      isDeletingCategory
    ) {
      return setStatus('loading')
    }

    setStatus('saved')
  }, [
    isUpdating,
    isDeleting,
    isAddingHero,
    isMovingHero,
    isAddingCategory,
    isMovingCategory,
    isResizingCategory,
    isDeletingCategory
  ])

  return (
    <Container>
      <StatusIndicatorContainer>
        {status === 'saved' && (
          <StatusIndicator>
            <StatusIndicatorIcon>
              <Icon name="check-circle" />
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
