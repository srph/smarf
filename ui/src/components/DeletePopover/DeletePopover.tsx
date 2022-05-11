import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Spacer, Input, Popover, PopoverProps } from '~/src/components'
import { theme } from '~/src/theme'

interface DeletePopoverProps {
  open: boolean
  onConfirm: () => void
  onDismiss: () => void
  nameConfirmation?: string
  nameConfirmationPlaceholder?: string
  strategy?: PopoverProps['strategy']
  placement?: PopoverProps['placement']
  offset?: PopoverProps['offset']
  trigger: PopoverProps['trigger']
  container?: PopoverProps['container']
}

const DeletePopover: React.FC<DeletePopoverProps> = ({
  open,
  onConfirm,
  onDismiss,
  nameConfirmation,
  nameConfirmationPlaceholder,
  strategy,
  placement,
  offset,
  trigger,
  container
}) => {
  const [name, setName] = useState('')

  useEffect(() => {
    if (!open) setName('')
  }, [open])

  return (
    <Popover
      open={open}
      onChangeOpen={onDismiss}
      strategy={strategy}
      offset={offset}
      placement={placement}
      container={container}
      trigger={trigger}>
      <Container>
        <HeadingText>Delete Confirmation</HeadingText>

        <Spacer size={1} />

        <Text>Are you sure to do this? This action cannot be undone.</Text>

        <Spacer size={2} />

        {nameConfirmation && (
          <Input
            placeholder={
              nameConfirmationPlaceholder ? `${nameConfirmationPlaceholder} (${nameConfirmation})` : nameConfirmation
            }
            value={name}
            onChange={setName}
          />
        )}

        <Spacer size={2} />

        <Actions>
          <ActionItem>
            <Button variant="danger" block onClick={onConfirm} disabled={nameConfirmation && name !== nameConfirmation}>
              Delete
            </Button>
          </ActionItem>

          <ActionItem>
            <Button variant="clear" block onClick={onDismiss}>
              Cancel
            </Button>
          </ActionItem>
        </Actions>
      </Container>
    </Popover>
  )
}

const Container = styled.div`
  padding: 16px;
  width: 280px;
  background ${theme.colors.neutral[800]};
  border: 1px solid ${theme.colors.neutral[700]};
  border-radius: 4px;
`

const HeadingText = styled.h4`
  font-weight: 400;
  margin: 0;
`

const Text = styled.p`
  margin: 0;
  color: ${theme.colors.neutral[400]};
  line-height: 1.75;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  margin-left: -8px;
  margin-right: -8px;
`

const ActionItem = styled.div`
  width: 50%;
  padding-left: 8px;
  padding-right: 8px;
`

export { DeletePopover, DeletePopoverProps }
