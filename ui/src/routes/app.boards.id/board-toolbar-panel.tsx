import React from 'react'
import { cn } from 'cn'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'

/** The ✕ in a toolbar panel's header. */
const BoardToolbarPanelClose: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    aria-label="Close"
    onClick={onClick}
    className="-mr-1.5 grid size-7 cursor-pointer place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-50 focus-visible:outline-2 focus-visible:outline-sky-500">
    <Icon icon={XMarkIcon} size={16} />
  </button>
)

const KBD_TONES = {
  dark: 'border-zinc-700 bg-zinc-800 text-zinc-400',
  light: 'border-white/20 bg-white/14 text-primary-100'
}

/** A key hint, like Esc or ↵. */
const BoardToolbarKbd: React.FC<React.PropsWithChildren<{ tone?: keyof typeof KBD_TONES }>> = ({
  tone = 'dark',
  children
}) => (
  <kbd
    className={cn(
      'inline-block min-w-5 rounded border border-b-2 px-1 py-px text-center font-mono text-xs leading-none font-semibold',
      KBD_TONES[tone]
    )}>
    {children}
  </kbd>
)

export { BoardToolbarPanelClose, BoardToolbarKbd }
