import React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'

type PositionerProps = React.ComponentProps<typeof BasePopover.Positioner>

interface PopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // A <button>. Base UI makes it toggle the popover and adds the aria attributes and
  // `data-popup-open` while open, so the trigger needs no onClick of its own.
  trigger: React.ReactElement
  side?: PositionerProps['side']
  align?: PositionerProps['align']
  sideOffset?: number
  // Position against this element instead of the trigger.
  anchor?: Element | null
  positionMethod?: PositionerProps['positionMethod']
  // Focused on open. Defaults to the first focusable element in the popup.
  initialFocus?: React.RefObject<HTMLElement | null>
}

// Closes on Escape and outside clicks, and follows the anchor as it moves or resizes.
const Popover: React.FC<React.PropsWithChildren<PopoverProps>> = ({
  open,
  onOpenChange,
  trigger,
  side = 'bottom',
  align = 'center',
  sideOffset = 0,
  anchor,
  positionMethod,
  initialFocus,
  children
}) => {
  return (
    <BasePopover.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <BasePopover.Trigger render={trigger} />

      <BasePopover.Portal>
        <BasePopover.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          anchor={anchor}
          positionMethod={positionMethod}
          className="z-(--z-popover)">
          <BasePopover.Popup initialFocus={initialFocus} className="outline-none">
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  )
}

const PopoverClose = BasePopover.Close

export { Popover, PopoverClose, type PopoverProps }
