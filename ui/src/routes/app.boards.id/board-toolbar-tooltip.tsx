import React from 'react'
import { cn } from 'cn'
import { Tooltip } from '@base-ui/react/tooltip'

interface Props {
  label: React.ReactNode
  // The element that shows the tooltip on hover and focus. Base UI passes it props and a ref.
  children: React.ReactElement
  disabled?: boolean
}

/** A toolbar hint above its trigger. Wrap the toolbar in `Tooltip.Provider` so moving between buttons skips the delay. */
const BoardToolbarTooltip: React.FC<Props> = ({ label, children, disabled }) => (
  <Tooltip.Root disabled={disabled}>
    <Tooltip.Trigger render={children} />
    <Tooltip.Portal>
      <Tooltip.Positioner side="top" sideOffset={10} className="z-(--z-popover)">
        <Tooltip.Popup
          className={cn(
            'max-w-96 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 shadow-lg shadow-black/60',
            'transition-[opacity,translate] duration-150 data-instant:transition-none',
            'data-ending-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:opacity-0'
          )}>
          {label}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
)

interface IconButtonProps extends React.ComponentProps<'button'> {
  // Read by screen readers and shown as the tooltip.
  label: string
}

/** A 36px icon button in the dock, with its label as a tooltip. Menu and popover triggers can render it. */
const BoardToolbarIconButton: React.FC<IconButtonProps> = ({ label, className, ...props }) => (
  <BoardToolbarTooltip label={label}>
    <button
      type="button"
      aria-label={label}
      {...props}
      className={cn(
        'grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-zinc-400 transition-[background-color,color,scale] duration-150',
        'hover:bg-white/9 hover:text-zinc-50 active:scale-94 data-popup-open:bg-white/9 data-popup-open:text-zinc-50',
        'focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  </BoardToolbarTooltip>
)

export { BoardToolbarTooltip, BoardToolbarIconButton }
