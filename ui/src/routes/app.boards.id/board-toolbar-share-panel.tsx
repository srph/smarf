import React, { useEffect, useRef } from 'react'
import { cn } from 'cn'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { GlobeAltIcon, LockClosedIcon } from '@heroicons/react/20/solid'
// Drawn for 16px, so the check keeps its weight at that size.
import { CheckIcon } from '@heroicons/react/16/solid'
import { Icon, type IconComponent } from '~/src/components/icon/icon'
import { useDelayedState } from '~/src/hooks/use-delayed-state'
import { useBoard } from './board-context'
import { BoardToolbarPanelClose } from './board-toolbar-panel'
import { BoardToolbarShareLink } from './board-toolbar-share-link'
import { usePublishBoardMutation } from './mutations/use-publish-board-mutation'

type Visibility = 'private' | 'public'

// Publishing shimmers this long at least, so a quick save shows the shimmer instead of a flicker.
const PUBLISHING_MIN_MS = 700

// The highlight slides between the rows; the link opens below Public, as the dock's cards grow (ease-morph).
const EASE = [0.3, 0.7, 0.2, 1] as const
const slide: Transition = { duration: 0.38, ease: EASE }
const open: Transition = { height: { duration: 0.38, ease: EASE }, opacity: { duration: 0.25, delay: 0.1 } }
const close: Transition = { height: { duration: 0.3, ease: EASE }, opacity: { duration: 0.15 } }

interface Props {
  onClose: () => void
}

/**
 * The dock as a share card: Private or Public. Choosing Public saves right away (the highlight slides over first) and
 * opens the link below it, with a copy button inside the field; until it's saved, a shimmering bar stands in for the link.
 */
const BoardToolbarSharePanel: React.FC<Props> = ({ onClose }) => {
  const { board } = useBoard()

  const { mutate: publishBoard, isPending, variables } = usePublishBoardMutation(board.id)

  const [publishing, setPublishing] = useDelayedState(false, (previous) => previous, PUBLISHING_MIN_MS)

  useEffect(() => {
    setPublishing(isPending && variables?.is_public === true)
  }, [isPending, variables, setPublishing])

  // Switched back to Private while the shimmer holds: it's private now, so nothing is publishing.
  const isPublishing = publishing && board.is_public

  const groupRef = useRef<HTMLDivElement>(null)

  // Opening the card puts focus on the chosen option; the arrow keys move between them.
  useEffect(() => {
    groupRef.current?.querySelector<HTMLElement>('[data-checked]')?.focus({ preventScroll: true })
  }, [])

  const visibility: Visibility = board.is_public ? 'public' : 'private'

  const handleChange = (value: unknown) => {
    if (value === visibility) return
    publishBoard({ is_public: value === 'public' })
  }

  return (
    <div className="p-4">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="font-bold">Share board</h2>
        <BoardToolbarPanelClose onClick={onClose} />
      </div>

      <RadioGroup
        ref={groupRef}
        aria-label="Who can see this board"
        value={visibility}
        onValueChange={handleChange}
        className="grid gap-0.5">
        <ShareOption
          value="private"
          checked={visibility === 'private'}
          icon={LockClosedIcon}
          label="Private"
          hint="Only you can see it"
        />
        <ShareOption
          value="public"
          checked={visibility === 'public'}
          busy={isPublishing}
          icon={GlobeAltIcon}
          label="Public"
          hint="Anyone with the link can view"
        />
      </RadioGroup>

      <AnimatePresence initial={false}>
        {board.is_public && (
          <motion.div
            key="link"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: open }}
            exit={{ height: 0, opacity: 0, transition: close }}
            className="overflow-hidden">
            <BoardToolbarShareLink boardId={board.id} pending={isPublishing} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ShareOptionProps {
  value: Visibility
  checked: boolean
  /** Saving: the check waits until it's done. */
  busy?: boolean
  icon: IconComponent
  label: string
  hint: string
}

/** One choice: an icon, its name and what it means, and a check. The chosen one's highlight slides between them. */
const ShareOption: React.FC<ShareOptionProps> = ({ value, checked, busy = false, icon, label, hint }) => (
  <Radio.Root
    value={value}
    className={cn(
      'relative flex h-13 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-zinc-400 transition-colors duration-250 outline-none',
      'hover:text-zinc-200 focus-visible:ring-focus data-checked:text-zinc-50'
    )}>
    {checked && (
      <motion.span
        layoutId="share-highlight"
        transition={slide}
        className="absolute inset-0 rounded-xl bg-white/8 inset-shadow-xs inset-shadow-white/5"
      />
    )}

    <span
      className={cn(
        'relative text-zinc-500 transition-[color,rotate,scale] duration-400 ease-morph motion-reduce:transition-none',
        checked && 'text-primary-300',
        // The globe turns a little as it's chosen.
        checked && value === 'public' && 'scale-110 -rotate-20'
      )}>
      <Icon icon={icon} size={18} />
    </span>

    <span className="relative min-w-0">
      <span className="block font-semibold">{label}</span>
      <span className="block text-xs text-zinc-500">{hint}</span>
    </span>

    <span
      className={cn(
        'relative ml-auto text-primary-300 transition-[opacity,scale] duration-300 ease-morph',
        checked && !busy ? 'scale-100 opacity-100 delay-100' : 'scale-50 opacity-0'
      )}>
      <Icon icon={CheckIcon} size={16} />
    </span>
  </Radio.Root>
)

export { BoardToolbarSharePanel }
