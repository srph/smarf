import React from 'react'
import { cn } from 'cn'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { NEW_BOARD_DOCK } from '~/src/routes/app.boards.id/use-new-board-handoff'
import { StartPreview } from './start-preview'
import { type ResolvedStart, type Start } from './starts/start'

/** choosing: the tray. saving: folded into a dock-sized "Creating …" bar. failed: the tray again, saying so. */
type TrayPhase = 'choosing' | 'saving' | 'failed'

interface Props {
  phase: TrayPhase
  /** The start being saved, or the one that failed. */
  chosen: ResolvedStart | undefined
  /** Set once the fold has finished: the bar takes the id the dock on /b/:id slides in from. */
  folded: boolean
  starts: ResolvedStart[]
  onHover: (id: Start['id'] | null) => void
  onChoose: (start: ResolvedStart) => void
}

// The tray's width, and the bar's: the dock's (its fixed-width switcher, three icon buttons, padding and border),
// which the bar slides into once the board opens.
const TRAY = { width: 840 }
const BAR = { width: 320, height: 46 }

/** The fold into the bar (and back out after a failure). The route waits this long before it opens the board. */
const FOLD_MS = 500
const fold: Transition = { duration: FOLD_MS / 1000, ease: [0.3, 0.7, 0.2, 1] }
// toolbar-rise, the dock's own entrance
const rise: Transition = { duration: 0.5, ease: [0.3, 0.7, 0.2, 1], delay: 0.1 }

/**
 * "Start this board with": the three starts, in the board toolbar's place until one is chosen. Choosing one folds
 * the tray into a dock-sized bar ("Creating Tier List") while the board saves.
 */
const StartTray: React.FC<Props> = ({ phase, chosen, folded, starts, onHover, onChoose }) => {
  const saving = phase === 'saving'

  return (
    // The toolbar's own wrapper, so the bar ends up centred where the dock's row will be.
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-(--z-board-toolbar) flex justify-center px-4">
      <motion.section
        // Folded, the heading is gone and the bar's text names it
        aria-labelledby={saving ? undefined : 'start-tray-heading'}
        aria-label={saving ? `Creating ${chosen?.name}` : undefined}
        aria-busy={saving || undefined}
        layoutId={folded ? NEW_BOARD_DOCK : undefined}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, ...(saving ? BAR : { ...TRAY, height: 'auto' }) }}
        transition={{ default: fold, opacity: rise, y: rise }}
        onPointerLeave={() => onHover(null)}
        className={cn(
          'pointer-events-auto relative overflow-hidden rounded-xl border border-white/10 shadow-2xl ring-1 inset-shadow-xs shadow-black/70 ring-black/50 inset-shadow-white/5 backdrop-blur-lg backdrop-saturate-150 transition-colors duration-500',
          // The bar is the dock's glass, so the two look the same when one takes over from the other.
          saving ? 'bg-zinc-800/60' : 'bg-zinc-800/88'
        )}>
        <AnimatePresence initial={false}>
          {saving ? (
            <motion.p
              key="bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="absolute inset-0 grid animate-creating-glint place-items-center bg-creating-glint bg-clip-text font-semibold whitespace-nowrap text-transparent motion-reduce:animate-none">
              Creating {chosen?.name}
            </motion.p>
          ) : (
            <motion.div
              key="tray"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              // The tray's full width, so its contents don't reflow while it folds; the section clips them.
              className="p-3"
              style={TRAY}>
              <div className="flex items-baseline justify-between gap-4 px-1 pb-2.5">
                <h2 id="start-tray-heading" className="font-semibold text-zinc-200">
                  Start this board with
                </h2>
                {phase === 'failed' && (
                  <p role="alert" className="flex items-center gap-1.5 text-sm text-red-300">
                    <span className="text-red-400">
                      <Icon icon={ExclamationCircleIcon} size={16} />
                    </span>
                    Couldn't create the board. Choose again.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {starts.map((start) => (
                  <button
                    key={start.id}
                    type="button"
                    onClick={() => onChoose(start)}
                    onPointerEnter={() => onHover(start.id)}
                    onFocus={() => onHover(start.id)}
                    onBlur={() => onHover(null)}
                    className="group flex cursor-pointer flex-col rounded-xl bg-white/3 px-1.5 pt-1.5 pb-2.5 text-left inset-ring inset-ring-white/6 transition-[background-color,box-shadow,translate] duration-150 hover:-translate-y-0.5 hover:bg-white/7 hover:inset-ring-white/14 focus-visible:-translate-y-0.5 focus-visible:bg-white/7 focus-visible:ring-focus motion-reduce:hover:translate-y-0">
                    <StartPreview start={start} />
                    <span className="px-1 font-semibold">{start.name}</span>
                    <span className="mt-0.5 px-1 text-xs text-zinc-400">{start.description}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  )
}

export { type TrayPhase, FOLD_MS, StartTray }
