import React, { useState } from 'react'
import { cn } from 'cn'
import { Container } from '~/src/components/container/container'
import { Icon } from '~/src/components/icon/icon'
import { DeletePopover } from '~/src/components/delete-popover/delete-popover'
import { useBoardDraft } from '~/src/routes/app.boards.id/board-draft-context'
import { useBoardsQuery } from '~/src/queries/boards/use-boards-query'
import { useFavoriteBoardMutation } from '~/src/queries/boards/use-favorite-board-mutation'
import { useUpdateBoardMutation } from '../queries/use-update-board-mutation'
import { useDuplicateBoardMutation } from '../queries/use-duplicate-board-mutation'
import { useDeleteBoardMutation } from '../queries/use-delete-board-mutation'
import { useAddCategoryMutation, newCategory } from '../queries/use-add-category-mutation'
import { EditPopover } from '../edit-popover/edit-popover'
import { ToolbarStatusIndicator } from './toolbar-status-indicator'
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
  const { board } = useBoardDraft()

  const { mutate: favoriteBoard, isPending: isFavoriteLoading } = useFavoriteBoardMutation(board.id)

  const { mutate: updateBoard, isPending: isUpdating } = useUpdateBoardMutation(board.id)

  const { mutate: duplicateBoard, isPending: isDuplicating } = useDuplicateBoardMutation(board.id)

  const { mutate: deleteBoard, isPending: isDeleting } = useDeleteBoardMutation(board.id)

  const { mutate: addCategory, isPending: isAddingCategory } = useAddCategoryMutation(board.id)

  const [isEditing, setIsEditing] = useState(false)

  const [toolbarElement, setToolbarElement] = useState<HTMLDivElement | null>(null)

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

  const { data: boards, status: boardsStatus } = useBoardsQuery()

  const navigate = useNavigate()

  const handleBoardChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/b/${evt.target.value}`)
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-6 z-(--z-board-toolbar)">
        <ToolbarStatusIndicator />

        <Container>
          <div ref={setToolbarElement} className="flex items-center justify-between rounded bg-zinc-700 p-2">
            <div className="flex items-center">
              <label className="relative w-80 cursor-pointer rounded ring-2 ring-transparent transition-all duration-200 focus-within:ring-sky-500 hover:ring-sky-500">
                <div className="pointer-events-none absolute inset-y-0 left-0 p-2 text-zinc-500">
                  <Icon icon={RectangleGroupIcon} />
                </div>
                <select
                  value={board.id}
                  onChange={handleBoardChange}
                  className="block w-full cursor-pointer appearance-none rounded border border-zinc-600 bg-zinc-900 p-2 pl-8 text-zinc-50">
                  {boardsStatus === 'pending' && <option>Loading boards...</option>}
                  {boardsStatus === 'error' && <option>Couldn't load boards</option>}
                  {boardsStatus === 'success' &&
                    boards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {b.id === board.id ? ' (Selected)' : ''}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 p-2 text-zinc-500">
                  <Icon icon={ChevronDoubleDownIcon} />
                </div>
              </label>

              <div className="ml-2 flex">
                <IconGroupButton
                  onClick={() => favoriteBoard({ is_favorite: !board.is_favorite })}
                  title={board.is_favorite ? 'Remove board from favorites' : 'Add board to favorites'}
                  active={board.is_favorite}
                  disabled={isFavoriteLoading}>
                  <Icon icon={board.is_favorite ? StarIcon : StarOutlineIcon} />
                </IconGroupButton>
              </div>
            </div>

            <div className="flex items-center">
              <div className="ml-2 flex">
                <IconGroupButton
                  onClick={() => addCategory(newCategory(board))}
                  title="New category"
                  disabled={isAddingCategory}>
                  <Icon icon={PlusCircleIcon} />
                </IconGroupButton>

                <IconGroupButton
                  onClick={() => duplicateBoard(undefined, { onSuccess: (copy) => navigate(`/b/${copy.id}`) })}
                  title="Duplicate board"
                  disabled={isDuplicating}>
                  <Icon icon={DocumentDuplicateIcon} />
                </IconGroupButton>

                <EditPopover
                  open={isEditing}
                  onOpenChange={setIsEditing}
                  name={board.name}
                  onSubmit={(name) => updateBoard({ name }, { onSuccess: () => setIsEditing(false) })}
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
                  onConfirm={() => deleteBoard(undefined, { onSuccess: () => navigate('/') })}
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
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}

// A component (not just classes) because popover triggers pass it props and a ref.
const IconGroupButton: React.FC<React.ComponentProps<'button'> & { active?: boolean }> = ({
  active = false,
  className,
  ...props
}) => (
  <button
    {...props}
    className={cn(
      'relative z-(--z-board-toolbar-icon) inline-flex cursor-pointer items-center border-zinc-700 bg-zinc-900 px-3 py-2 ring-2 ring-transparent transition-all duration-200',
      'not-last:border-r first:rounded-l last:rounded-r',
      'hover:z-(--z-board-toolbar-hovered-icon) hover:ring-sky-500 focus:z-(--z-board-toolbar-hovered-icon) focus:ring-sky-500',
      active ? 'text-yellow-500' : 'text-zinc-500',
      className
    )}
  />
)

export { ToolbarComponent as Toolbar }
