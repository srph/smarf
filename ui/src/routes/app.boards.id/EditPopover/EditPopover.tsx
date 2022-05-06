import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Container, PlainButton, Icon } from '~/src/components'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts'

const EditPopover: React.FC = () => {
  const { board, isEditing, setIsEditing, updateBoard } = useBoardWorkspace()
  const [name, setName] = useState(board.name)

  const handleClose = () => {
    setIsEditing(false)
    setName(board.name)
  }

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    updateBoard({ name })
  }

  const handleChangeName = (evt: React.ChangeEvent) => {
    setName(evt.target.value)
  }

  if (!isEditing) {
    return null
  }

  return (
    <EditPopoverContainer>
      <Container>
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
                placeholder="Enter name..."
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
      </Container>
    </EditPopoverContainer>
  )
}

const EditPopoverContainer = styled.div`
  position: fixed;
  bottom: 90px;
  left: 0;
  right: 0;
  z-index: ${theme.zIndex.editPopover};
`

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

const InputGroupButton = styled.div`
  display: inline-block;
  padding: 4px;
  background: ${theme.colors.neutral[500]};
  border-radius: 4px;
  cursor: pointer;
`

export { EditPopover }
