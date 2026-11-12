import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Button, Container, Icon, DeletePopover } from '~/src/components'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts'
import { useBoardList } from '~/src/contexts/BoardList'
import { EditPopover } from '../EditPopover'
import { ToolbarStatusIndicator } from './ToolbarStatusIndicator'
import { useNavigate } from 'react-router'
import {
  ChevronDoubleDownIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  PlusCircleIcon,
  RectangleGroupIcon,
  StarIcon,
  TrashIcon
} from '@heroicons/react/20/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

const ToolbarComponent: React.FC = () => {
  const {
    board,
    duplicateBoard,
    favoriteBoard,
    deleteBoard,
    addCategory,
    isUpdating,
    isFavoriteLoading,
    isDuplicating,
    isDeleting,
    isAddingCategory
  } = useBoardWorkspace()

  const [toolbarElement, setToolbarElement] = useState<HTMLDivElement>()

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

  const { boards, isBoardListLoading } = useBoardList()

  const navigate = useNavigate()

  const handleBoardChange = (evt) => {
    navigate(`/b/${evt.target.value}`)
  }

  return (
    <>
      <ToolbarContainer>
        <ToolbarStatusIndicator />

        <Container>
          <Toolbar ref={setToolbarElement}>
            <ToolbarSection>
              <SelectContainer>
                <SelectIcon>
                  <Icon icon={RectangleGroupIcon} />
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
                  <Icon icon={ChevronDoubleDownIcon} />
                </SelectCaret>
              </SelectContainer>

              <IconGroup>
                <IconGroupButton
                  onClick={() => favoriteBoard()}
                  title={board.is_favorite ? 'Remove board from favorites' : 'Add board to favorites'}
                  color={board.is_favorite && theme.colors.yellow[500]}
                  disabled={isFavoriteLoading}>
                  <Icon icon={board.is_favorite ? StarIcon : StarOutlineIcon} />
                </IconGroupButton>
              </IconGroup>
            </ToolbarSection>

            <ToolbarActions>
              <IconGroup>
                <IconGroupButton onClick={() => addCategory()} title="New category" disabled={isAddingCategory}>
                  <Icon icon={PlusCircleIcon} />
                </IconGroupButton>

                <IconGroupButton onClick={() => duplicateBoard()} title="Duplicate board" disabled={isDuplicating}>
                  <Icon icon={DocumentDuplicateIcon} />
                </IconGroupButton>

                <EditPopover
                  trigger={
                    <IconGroupButton title="Edit board name" disabled={isUpdating}>
                      <Icon icon={PencilIcon} />
                    </IconGroupButton>
                  }
                  anchor={toolbarElement}
                />

                <DeletePopover
                  open={isDeleteConfirmationOpen}
                  onOpenChange={setIsDeleteConfirmationOpen}
                  onConfirm={deleteBoard}
                  nameConfirmation={board.name}
                  nameConfirmationPlaceholder="Enter board name"
                  side="top"
                  align="end"
                  sideOffset={16}
                  positionMethod="fixed"
                  trigger={
                    <IconGroupButton disabled={isDeleting} title="Delete board">
                      <Icon icon={TrashIcon} />
                    </IconGroupButton>
                  }
                  anchor={toolbarElement}
                />
              </IconGroup>
            </ToolbarActions>
          </Toolbar>
        </Container>
      </ToolbarContainer>
    </>
  )
}

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

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
`

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
`

const IconGroup = styled.div`
  display: flex;
  margin-left: 8px;
`

const IconGroupButton = styled.button<{ color?: string }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  color: ${(props) => props.color || theme.colors.neutral[500]};
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
