import React from 'react'
import { cn } from 'cn'
import { Popover as BasePopover } from '@base-ui/react/popover'

// Glass: translucent and blurred, for popovers that come off the board toolbar's dock. Popover is the solid copy.

type PositionerProps = Pick<
  React.ComponentProps<typeof BasePopover.Positioner>,
  'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor' | 'positionMethod' | 'collisionPadding'
>

type PopupProps = Omit<React.ComponentProps<typeof BasePopover.Popup>, 'className'> &
  PositionerProps & { className?: string }

/**
 * The popup with its Portal and Positioner: frosted zinc that slides up into place, padded for rows. It closes on
 * Escape and outside clicks. Pass the width through `className`.
 */
const Popup: React.FC<PopupProps> = ({
  side = 'bottom',
  align = 'center',
  sideOffset = 0,
  alignOffset,
  anchor,
  positionMethod,
  collisionPadding,
  className,
  ...props
}) => (
  <BasePopover.Portal>
    <BasePopover.Positioner
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      anchor={anchor}
      positionMethod={positionMethod}
      collisionPadding={collisionPadding}
      className="z-(--z-popover)">
      <BasePopover.Popup
        {...props}
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-800/95 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-md outline-none focus-gap-zinc-800',
          'transition-[opacity,translate] duration-200 data-ending-style:translate-y-1 data-ending-style:opacity-0 data-ending-style:duration-150',
          'data-starting-style:translate-y-1 data-starting-style:opacity-0',
          className
        )}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
)

const GlassPopover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Popup,
  Close: BasePopover.Close
}

export { GlassPopover }
