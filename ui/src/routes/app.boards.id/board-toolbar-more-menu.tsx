import React from 'react'
import { cn } from 'cn'
import { Menu } from '@base-ui/react/menu'
import { DocumentDuplicateIcon, EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { BoardToolbarIconButton } from './board-toolbar-tooltip'

interface Props {
  onDuplicate: () => void
  onDelete: () => void
  isDuplicating: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const item =
  'flex h-9 cursor-pointer items-center gap-2.5 rounded-lg pr-2 pl-2.5 text-zinc-200 outline-none data-disabled:cursor-progress data-disabled:opacity-60 data-highlighted:bg-white/7 focus-visible:inset-ring-2 focus-visible:inset-ring-sky-400'

/** The board's less frequent actions: Duplicate, and Delete below a rule. */
const BoardToolbarMoreMenu: React.FC<Props> = ({ onDuplicate, onDelete, isDuplicating, ref }) => (
  <Menu.Root>
    <Menu.Trigger render={<BoardToolbarIconButton ref={ref} label="More board actions" />}>
      <Icon icon={EllipsisHorizontalIcon} />
    </Menu.Trigger>

    <Menu.Portal>
      <Menu.Positioner side="top" align="end" alignOffset={-4} sideOffset={10} className="z-(--z-popover)">
        <Menu.Popup
          className={cn(
            'w-56 rounded-xl border border-white/10 bg-zinc-800/95 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-md outline-none',
            'transition-[opacity,translate] duration-200 data-ending-style:translate-y-1 data-ending-style:opacity-0 data-ending-style:duration-150',
            'data-starting-style:translate-y-1 data-starting-style:opacity-0'
          )}>
          <Menu.Item className={item} onClick={onDuplicate} disabled={isDuplicating}>
            <span className="text-zinc-400">
              <Icon icon={DocumentDuplicateIcon} size={16} />
            </span>
            {isDuplicating ? 'Duplicating…' : 'Duplicate board'}
          </Menu.Item>

          <Menu.Separator className="mx-1 my-1 border-t border-white/8" />

          <Menu.Item
            className={cn(item, 'text-red-400 focus-visible:inset-ring-red-400 data-highlighted:bg-red-500/14')}
            onClick={onDelete}>
            <Icon icon={TrashIcon} size={16} />
            Delete board…
          </Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
)

export { BoardToolbarMoreMenu }
