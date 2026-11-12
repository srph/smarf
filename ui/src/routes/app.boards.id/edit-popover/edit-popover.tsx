import React, { useId, useRef, useState } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
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

  const inputId = useId()

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
      <div className="relative flex">
        <div className="absolute -top-8 right-0 text-zinc-500">
          <PopoverClose render={<PlainButton type="button" title="Close" />}>
            <Icon icon={XMarkIcon} />
          </PopoverClose>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ml-auto flex items-center rounded border border-zinc-700 bg-zinc-900 p-4">
          <label htmlFor={inputId} className="mr-4">
            Name
          </label>

          <div className="flex items-center rounded border border-zinc-700 bg-zinc-900 ring-sky-500 focus-within:ring-2 hover:ring-2">
            <input
              ref={inputRef}
              id={inputId}
              value={name}
              onChange={handleChangeName}
              type="text"
              placeholder={board.name}
              className="block bg-transparent p-3 text-zinc-50 outline-none"
            />
            <div className="p-1">
              <button className="inline-flex cursor-pointer items-center justify-center rounded bg-zinc-500 p-1 text-zinc-50 transition-colors duration-200 hover:bg-zinc-600 focus:bg-zinc-600">
                <Icon icon={CheckIcon} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </Popover>
  )
}

export { EditPopover }
