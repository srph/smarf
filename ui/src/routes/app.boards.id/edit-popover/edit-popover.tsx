import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { theme } from '~/src/theme'
import { PlainButton } from '~/src/components/plain-button/plain-button'
import { Popover, PopoverClose, type PopoverProps } from '~/src/components/popover/popover'
import { Icon } from '~/src/components/icon/icon'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts/board-workspace-context'

interface Props {
  trigger: PopoverProps['trigger']
  anchor: HTMLElement | null
}

// @TODO: For slow requests / connections, we should probably prevent
// the popover from being closed while the board is being updated (?)
const EditPopover: React.FC<Props> = ({ trigger, anchor }) => {
  const { board, isEditing, setIsEditing, updateBoard } = useBoardWorkspace()

  const [name, setName] = useState(board.name)

  const inputRef = useRef<HTMLInputElement>(null)

  // Start from the current name each time the editor opens.
  const handleOpenChange = (open: boolean) => {
    if (open) setName(board.name)
    setIsEditing(open)
  }

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    updateBoard({ name })
  }

  const handleChangeName = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setName(evt.target.value)
  }

  return (
    <Popover
      open={isEditing}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      anchor={anchor}
      positionMethod="fixed"
      side="top"
      align="end"
      sideOffset={16}
      initialFocus={inputRef}>
      <EditPopoverInner>
        <EditPopoverClose>
          <PopoverClose render={<PlainButton type="button" title="Close" />}>
            <Icon icon={XMarkIcon} />
          </PopoverClose>
        </EditPopoverClose>

        <EditPopoverForm onSubmit={handleSubmit}>
          <EditPopoverLabel>Name</EditPopoverLabel>

          <InputGroup>
            <InputGroupElement
              ref={inputRef}
              value={name}
              onChange={handleChangeName}
              type="text"
              placeholder={board.name}
            />
            <InputGroupButtonContainer>
              <InputGroupButton>
                <Icon icon={CheckIcon} />
              </InputGroupButton>
            </InputGroupButtonContainer>
          </InputGroup>
        </EditPopoverForm>
      </EditPopoverInner>
    </Popover>
  )
}

const EditPopoverInner = styled.div`
  display: flex;
  position: relative;
`

const EditPopoverClose = styled.div`
  position: absolute;
  top: -32px;
  right: 0;
  color: ${theme.colors.neutral[500]};
`

const EditPopoverForm = styled.form`
  display: flex;
  align-items: center;
  margin: 0;
  margin-left: auto;
  padding: 16px;
  background: ${theme.colors.neutral[900]};
  border: 1px solid ${theme.colors.neutral[700]};
  border-radius: 4px;
`

const EditPopoverLabel = styled.label`
  margin-right: 16px;
`

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.neutral[900]};
  border: 1px solid ${theme.colors.neutral[700]};
  border-radius: 4px;

  &:hover,
  &:focus-within {
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }
`

const InputGroupElement = styled.input`
  display: block;
  padding: 12px;
  color: ${theme.colors.neutral[50]};
  background: transparent;
  border: 0;
  outline: 0;
`

const InputGroupButtonContainer = styled.div`
  padding: 4px;
`

const InputGroupButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: ${theme.colors.neutral[50]};
  background: ${theme.colors.neutral[500]};
  border-radius: 4px;
  cursor: pointer;
  transition: background 200ms ease;

  &:hover,
  &:focus {
    background: ${theme.colors.neutral[600]};
  }
`

export { EditPopover }
