import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Button, Container, Icon } from '~/src/components'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts'
import { useBoardList } from '~/src/contexts/BoardList'
import { EditPopover } from '../EditPopover'
import { useNavigate } from 'react-router-dom'

const ToolbarComponent: React.FC = () => {
  const { board, isEditing, setIsEditing, addCategory, deleteBoard, isDeleting } = useBoardWorkspace()

  const [toolbarElement, setToolbarElement] = useState<HTMLDivElement>()

  const { boards, isBoardListLoading } = useBoardList()

  const navigate = useNavigate()

  const handleBoardChange = (evt) => {
    navigate(`/boards/${evt.target.value}`)
  }

  return (
    <>
      <ToolbarContainer>
        <Container>
          <StatusIndicatorContainer>
            <StatusIndicator>
              <StatusIndicatorIcon>
                <Icon name="check-circle" />
              </StatusIndicatorIcon>
              Saved
            </StatusIndicator>
          </StatusIndicatorContainer>
        </Container>

        <Container>
          <Toolbar ref={setToolbarElement}>
            <SelectContainer>
              <SelectIcon>
                <Icon name="template" />
              </SelectIcon>
              <Select value={board.id} onChange={handleBoardChange}>
                {isBoardListLoading ? (
                  <option>Loading boards...</option>
                ) : (
                  boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                      {b.id === board.id ? ' (Selected)' : ''}
                    </option>
                  ))
                )}
              </Select>
              <SelectCaret>
                <Icon name="chevron-double-down" />
              </SelectCaret>
            </SelectContainer>

            <ToolbarActions>
              <Button icon="plus-circle" onClick={addCategory}>
                New Category
              </Button>

              <IconGroup>
                <EditPopover
                  trigger={({ ref }) => (
                    <IconGroupButton ref={ref} onClick={() => setIsEditing(!isEditing)} title="Edit board name">
                      <Icon name="pencil" />
                    </IconGroupButton>
                  )}
                  container={toolbarElement}
                />

                <IconGroupButton onClick={() => deleteBoard()} disabled={isDeleting} title="Delete board">
                  <Icon name="trash" />
                </IconGroupButton>
              </IconGroup>
            </ToolbarActions>
          </Toolbar>
        </Container>
      </ToolbarContainer>
    </>
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

const SelectContainer = styled.label`
  position: relative;
  width: 320px;
  border-radius: 4px;
  border: 0;
  box-shadow: 0px 0px 0px 2px transparent;
  transition: 200ms all ease;
  cursor: pointer;

  &:hover,
  &:focus-within {
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }
`

const Select = styled.select`
  display: block;
  width: 100%;
  padding: 8px;
  padding-left: 32px;
  color: ${theme.colors.text};
  background: ${theme.colors.neutral[900]};
  border: 1px solid ${theme.colors.neutral[600]};
  border-radius: 4px;
  cursor: pointer;
  -moz-appearance: none;
  -webkit-appearance: none;
`

const SelectIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 8px;
  color: ${theme.colors.neutral[500]};
  pointer-events: none;
`

const SelectCaret = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 8px;
  color: ${theme.colors.neutral[500]};
  pointer-events: none;
`

const ToolbarContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 24px;
  z-index: ${theme.zIndex.boardToolbar};
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: ${theme.colors.neutral[700]};
  border-radius: 4px;
`

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
`

const IconGroup = styled.div`
  display: flex;
  margin-left: 16px;
`

const IconGroupButton = styled.button`
  position: relative;
  padding: 8px 12px;
  color: ${theme.colors.neutral[500]};
  background: ${theme.colors.neutral[900]};
  border: 0;
  cursor: pointer;
  box-shadow: 0px 0px 0px 2px transparent;
  transition: 200ms all ease;
  z-index: ${theme.zIndex.boardToolbarIcon};

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &:not(:last-child) {
    border-right: 1px solid ${theme.colors.neutral[700]};
  }

  &:hover,
  &:focus {
    z-index: ${theme.zIndex.boardToolbarHoveredIcon};
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }
`

export { ToolbarComponent as Toolbar }
