import React, { useRef, useState } from 'react'
import { Button } from '~/src/components/button/button'
import { Spacer } from '~/src/components/spacer/spacer'
import { Input } from '~/src/components/input/input'
import { Popover, type PopoverProps } from '~/src/components/popover/popover'

interface DeletePopoverProps extends Pick<
  PopoverProps,
  'open' | 'onOpenChange' | 'trigger' | 'side' | 'align' | 'sideOffset' | 'anchor' | 'positionMethod'
> {
  onConfirm: () => void
  nameConfirmation?: string
  nameConfirmationPlaceholder?: string
}

const DeletePopover: React.FC<DeletePopoverProps> = ({
  onConfirm,
  nameConfirmation,
  nameConfirmationPlaceholder,
  ...popoverProps
}) => {
  const { onOpenChange } = popoverProps

  const [name, setName] = useState('')

  const nameRef = useRef<HTMLInputElement>(null)

  const cancelRef = useRef<HTMLButtonElement>(null)

  // Start with an empty name field each time it opens.
  const handleOpenChange = (next: boolean) => {
    if (next) setName('')
    onOpenChange(next)
  }

  return (
    // Focus the name field, or Cancel, so Enter never deletes by accident.
    <Popover {...popoverProps} onOpenChange={handleOpenChange} initialFocus={nameConfirmation ? nameRef : cancelRef}>
      <div className="w-70 rounded border border-zinc-700 bg-zinc-800 p-4">
        <h4>Delete Confirmation</h4>

        <Spacer size={1} />

        <p className="leading-6 text-zinc-400">Are you sure to do this? This action cannot be undone.</p>

        <Spacer size={2} />

        {nameConfirmation && (
          <Input
            ref={nameRef}
            placeholder={
              nameConfirmationPlaceholder ? `${nameConfirmationPlaceholder} (${nameConfirmation})` : nameConfirmation
            }
            value={name}
            onChange={setName}
          />
        )}

        <Spacer size={2} />

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="danger"
            block
            onClick={onConfirm}
            disabled={Boolean(nameConfirmation) && name !== nameConfirmation}>
            Delete
          </Button>

          <Button ref={cancelRef} variant="clear" block onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Popover>
  )
}

export { DeletePopover, type DeletePopoverProps }
