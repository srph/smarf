import React from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { cn } from 'cn'

interface Props {
  // Where the hero was dropped, in client coordinates.
  x: number
  y: number
  onDone: () => void
}

// One dot every 45°, like the favorite star's burst.
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

/**
 * A poof where a hero was dropped off every category to remove it: dots fly out and fade.
 * Fixed to the page through a portal, so it sits on the drop point whatever the workspace clips or scrolls.
 * Callers skip it when the OS asks for reduced motion.
 */
const BoardWorkspaceDropPoof: React.FC<Props> = ({ x, y, onDone }) =>
  createPortal(
    <span
      aria-hidden="true"
      data-drop-poof=""
      className="pointer-events-none fixed z-(--z-board-workspace)"
      style={{ left: x, top: y }}>
      {ANGLES.map((angle, i) => (
        // The rotation sits on a wrapper: Motion puts translate before rotate, so on one element every dot would fly up.
        <span key={angle} className="absolute" style={{ transform: `rotate(${angle}deg)` }}>
          <motion.i
            className={cn('absolute -top-0.75 -left-0.75 size-1.5 rounded-full', i % 2 ? 'bg-zinc-400' : 'bg-red-400')}
            initial={{ y: -6, scale: 1, opacity: 1 }}
            animate={{ y: -30, scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1] }}
            onAnimationComplete={i === 0 ? onDone : undefined}
          />
        </span>
      ))}
    </span>,
    document.body
  )

export { BoardWorkspaceDropPoof }
