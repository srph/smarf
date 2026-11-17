import React from 'react'
import { cn } from 'cn'
import { Menu as BaseMenu } from '@base-ui/react/menu'

// Solid: a raised surface over the board or page. GlassMenu is the toolbar's translucent copy.

type PositionerProps = Pick<
  React.ComponentProps<typeof BaseMenu.Positioner>,
  'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor' | 'positionMethod' | 'collisionPadding'
>

type PopupProps = Omit<React.ComponentProps<typeof BaseMenu.Popup>, 'className'> &
  PositionerProps & { className?: string }

/**
 * The popup with its Portal and Positioner: a step lighter than the page, with a lit top edge and a deep shadow. It
 * rises in from the side it opens on. Pass the width (and anything else) through `className`.
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
          'origin-(--transform-origin) overflow-hidden rounded-xl border border-white/9 bg-raised shadow-2xl ring-1 inset-shadow-2xs shadow-black/75 ring-black/50 inset-shadow-white/6 outline-none focus-gap-raised',
          'transition-[opacity,translate,scale] duration-200 ease-morph data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-98 data-starting-style:opacity-0',
          'data-[side=bottom]:data-starting-style:-translate-y-1.5 data-[side=top]:data-starting-style:translate-y-1.5',
          className
        )}
      />
    </BaseMenu.Positioner>
  </BaseMenu.Portal>
)

const item =
  'flex h-9 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-zinc-200 outline-none [&_svg]:text-zinc-500 data-disabled:cursor-progress data-disabled:opacity-60 data-highlighted:bg-white/6 data-highlighted:text-zinc-50 data-highlighted:[&_svg]:text-primary-300 focus-visible:inset-ring-2 focus-visible:inset-ring-primary-400'

type ItemProps = Omit<React.ComponentProps<typeof BaseMenu.Item>, 'className'> & { className?: string }

/**
 * A row: put its icon first, as a child. The icon brightens to primary with the row. A red row (Log out) passes its
 * own highlight colours in `className`, which `cn` puts in place of these.
 */
const Item: React.FC<ItemProps> = ({ className, ...props }) => (
  <BaseMenu.Item {...props} className={cn(item, className)} />
)

type LinkItemProps = Omit<React.ComponentProps<typeof BaseMenu.LinkItem>, 'className'> & { className?: string }

/** A row that's a link: pass the router's `<Link to>` as `render`. Closes the menu when followed. */
const LinkItem: React.FC<LinkItemProps> = ({ className, closeOnClick = true, ...props }) => (
  <BaseMenu.LinkItem {...props} closeOnClick={closeOnClick} className={cn(item, className)} />
)

type SeparatorProps = Omit<React.ComponentProps<typeof BaseMenu.Separator>, 'className'> & { className?: string }

/** A full-width rule between the popup's sections. */
const Separator: React.FC<SeparatorProps> = ({ className, ...props }) => (
  <BaseMenu.Separator {...props} className={cn('h-px bg-white/7', className)} />
)

const Menu = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Popup,
  Item,
  LinkItem,
  Separator,
  Group: BaseMenu.Group
}

export { Menu }
