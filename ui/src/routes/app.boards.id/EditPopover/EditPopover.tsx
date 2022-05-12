import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { PlainButton, Popover, PopoverProps, Icon } from '~/src/components'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts'

interface Props {
  trigger: PopoverProps['trigger']
  container: HTMLElement
}

// @TODO: For slow requests / connections, we should probably prevent
// the popover from being closed while the board is being updated (?)
const EditPopover: React.FC<Props> = ({ trigger, container }) => {
  const { board, isEditing, setIsEditing, updateBoard } = useBoardWorkspace()

  const [name, setName] = useState(board.name)

  useEffect(() => {
    if (!isEditing) {
      setName(board.name)
    }
  }, [board.name, isEditing])

  const handleClose = () => {
    setIsEditing(false)
  }

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    updateBoard({ name })
  }

  const handleChangeName = (evt: React.ChangeEvent) => {
    setName(evt.target.value)
  }

  return (
    <Popover
      open={isEditing}
      onChangeOpen={setIsEditing}
      trigger={trigger}
      container={container}
      strategy="fixed"
      offset={{ x: 0, y: 16 }}
      placement="top-end">
      <EditPopoverInner>
        <EditPopoverClose>
          <PlainButton type="button" onClick={handleClose}>
            <Icon name="x" />
          </PlainButton>
        </EditPopoverClose>

        <EditPopoverForm onSubmit={handleSubmit}>
          <EditPopoverLabel>Name</EditPopoverLabel>

          <InputGroup>
            <InputGroupElement
              value={name}
              onChange={handleChangeName}
              type="text"
              placeholder={board.name}
              autoFocus
            />
            <InputGroupButtonContainer>
              <InputGroupButton>
                <Icon name="check" />
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
