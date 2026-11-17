import React from 'react'
import { DocumentDuplicateIcon, EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/20/solid'
import { GlassMenu } from '~/src/components/glass-menu/glass-menu'
import { Icon } from '~/src/components/icon/icon'
import { BoardToolbarIconButton } from './board-toolbar-tooltip'

interface Props {
  onDuplicate: () => void
  onDelete: () => void
  isDuplicating: boolean
  ref?: React.Ref<HTMLButtonElement>
}

/** The board's less frequent actions: Duplicate, and Delete below a rule. */
const BoardToolbarMoreMenu: React.FC<Props> = ({ onDuplicate, onDelete, isDuplicating, ref }) => (
  <GlassMenu.Root>
    <GlassMenu.Trigger render={<BoardToolbarIconButton ref={ref} label="More board actions" />}>
      <Icon icon={EllipsisHorizontalIcon} />
    </GlassMenu.Trigger>

    {/* The button sits 5px inside the dock (its border, then (44 - 36) / 2), so 15 here leaves the switcher's 10px
        gap above the dock itself. */}
    <GlassMenu.Popup side="top" align="end" alignOffset={-4} sideOffset={15} className="w-56">
      <GlassMenu.Item onClick={onDuplicate} disabled={isDuplicating}>
        <span className="text-zinc-400">
          <Icon icon={DocumentDuplicateIcon} size={16} />
        </span>
        {isDuplicating ? 'Duplicating' : 'Duplicate board'}
      </GlassMenu.Item>

      <GlassMenu.Separator />

      <GlassMenu.Item
        className="text-red-400 focus-visible:inset-ring-red-400 data-highlighted:bg-red-500/14"
        onClick={onDelete}>
        <Icon icon={TrashIcon} size={16} />
        Delete board…
      </GlassMenu.Item>
    </GlassMenu.Popup>
  </GlassMenu.Root>
)

export { BoardToolbarMoreMenu }
