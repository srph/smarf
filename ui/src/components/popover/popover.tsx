import React from 'react'
import { cn } from 'cn'
import { Popover as BasePopover } from '@base-ui/react/popover'

// Solid: a raised surface over the board or page. GlassPopover is the toolbar's translucent copy.

type PositionerProps = Pick<
  React.ComponentProps<typeof BasePopover.Positioner>,
  'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor' | 'positionMethod' | 'collisionPadding'
>

type PopupProps = Omit<React.ComponentProps<typeof BasePopover.Popup>, 'className'> &
  PositionerProps & { className?: string }

/**
 * The popup with its Portal and Positioner: a step lighter than the page, with a lit top edge and a deep shadow. It
 * rises in from the side it opens on, closes on Escape and outside clicks, and follows the anchor as it moves. Pass
 * the width (and anything else) through `className`.
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
          'origin-(--transform-origin) overflow-hidden rounded-xl border border-white/9 bg-raised shadow-2xl ring-1 inset-shadow-2xs shadow-black/75 ring-black/50 inset-shadow-white/6 outline-none focus-gap-raised',
          'transition-[opacity,translate,scale] duration-200 ease-morph data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-98 data-starting-style:opacity-0',
          'data-[side=bottom]:data-starting-style:-translate-y-1.5 data-[side=top]:data-starting-style:translate-y-1.5',
          className
        )}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
)

const Popover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Popup,
  Close: BasePopover.Close
}

export { Popover }
