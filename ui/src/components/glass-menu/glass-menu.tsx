import React from 'react'
import { cn } from 'cn'
import { Menu as BaseMenu } from '@base-ui/react/menu'

// Glass: translucent and blurred, for menus that come off the board toolbar's dock. Menu is the solid copy.

type PositionerProps = Pick<
  React.ComponentProps<typeof BaseMenu.Positioner>,
  'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor' | 'positionMethod' | 'collisionPadding'
>

type PopupProps = Omit<React.ComponentProps<typeof BaseMenu.Popup>, 'className'> &
  PositionerProps & { className?: string }

/** The popup with its Portal and Positioner: frosted zinc that slides up into place. Pass the width through `className`. */
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
  <BaseMenu.Portal>
    <BaseMenu.Positioner
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      anchor={anchor}
      positionMethod={positionMethod}
      collisionPadding={collisionPadding}
      className="z-(--z-popover)">
      <BaseMenu.Popup
        {...props}
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-800/95 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-md outline-none focus-gap-zinc-800',
          'transition-[opacity,translate] duration-200 data-ending-style:translate-y-1 data-ending-style:opacity-0 data-ending-style:duration-150',
          'data-starting-style:translate-y-1 data-starting-style:opacity-0',
          className
        )}
      />
    </BaseMenu.Positioner>
  </BaseMenu.Portal>
)

const item =
  'flex h-9 cursor-pointer items-center gap-2.5 rounded-lg pr-2 pl-2.5 text-zinc-200 outline-none data-disabled:cursor-progress data-disabled:opacity-60 data-highlighted:bg-white/7 focus-visible:inset-ring-2 focus-visible:inset-ring-sky-400'

type ItemProps = Omit<React.ComponentProps<typeof BaseMenu.Item>, 'className'> & { className?: string }

/** A row: put its icon first, as a child. A red row (Delete) overrides the text, highlight and ring colours. */
const Item: React.FC<ItemProps> = ({ className, ...props }) => (
  <BaseMenu.Item {...props} className={cn(item, className)} />
)

type LinkItemProps = Omit<React.ComponentProps<typeof BaseMenu.LinkItem>, 'className'> & { className?: string }

/** A row that's a link: pass the router's `<Link to>` as `render`. Closes the menu when followed. */
const LinkItem: React.FC<LinkItemProps> = ({ className, closeOnClick = true, ...props }) => (
  <BaseMenu.LinkItem {...props} closeOnClick={closeOnClick} className={cn(item, className)} />
)

type SeparatorProps = Omit<React.ComponentProps<typeof BaseMenu.Separator>, 'className'> & { className?: string }

/** A rule between groups of rows, inset from the popup's edges. */
const Separator: React.FC<SeparatorProps> = ({ className, ...props }) => (
  <BaseMenu.Separator {...props} className={cn('mx-1 my-1 border-t border-white/8', className)} />
)

const GlassMenu = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Popup,
  Item,
  LinkItem,
  Separator,
  Group: BaseMenu.Group
}

export { GlassMenu }
