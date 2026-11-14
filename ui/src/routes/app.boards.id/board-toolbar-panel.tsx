import React from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'

/** The ✕ in a toolbar panel's header. */
const BoardToolbarPanelClose: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    aria-label="Close"
    onClick={onClick}
    className="-mr-1.5 grid size-7 cursor-pointer place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-50 focus-visible:ring-focus">
    <Icon icon={XMarkIcon} size={16} />
  </button>
)

export { BoardToolbarPanelClose }
