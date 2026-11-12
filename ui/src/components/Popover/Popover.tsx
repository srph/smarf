import React from 'react'
import styled from 'styled-components'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { theme } from '~/src/theme'

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
        <Positioner side={side} align={align} sideOffset={sideOffset} anchor={anchor} positionMethod={positionMethod}>
          <Popup initialFocus={initialFocus}>{children}</Popup>
        </Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  )
}

const PopoverClose = BasePopover.Close

const Positioner = styled(BasePopover.Positioner)`
  z-index: ${theme.zIndex.popover};
`

const Popup = styled(BasePopover.Popup)`
  outline: 0;
`

export { Popover, PopoverClose, type PopoverProps }
