import React from 'react'
import { AnimatePresence, motion, useIsPresent, type Transition } from 'motion/react'

const EASE_MORPH = [0.3, 0.7, 0.2, 1] as const

// The leaving label lifts 6px and fades, then the new one rises in from 6px below.
const enter: Transition = { duration: 0.26, ease: EASE_MORPH, delay: 0.14 }
const exit: Transition = { duration: 0.14, ease: 'easeIn' }

interface Props {
  /** Identifies the label: when it changes, the labels swap. Defaults to the children when they're text. */
  swapKey?: string
  children: React.ReactNode
}

/**
 * A button label that swaps in place: `<LabelSwap>{pending ? 'Saving…' : 'Save'}</LabelSwap>`. Both labels share one
 * grid cell while they swap, so the button keeps its size. The first label doesn't animate in. With the OS's
 * reduce-motion setting on, they only fade (MotionConfig in app.tsx).
 */
const LabelSwap: React.FC<Props> = ({ swapKey, children }) => (
  <span className="grid justify-items-center">
    <AnimatePresence initial={false}>
      <Label key={swapKey ?? String(children)}>{children}</Label>
    </AnimatePresence>
  </span>
)

const Label: React.FC<React.PropsWithChildren> = ({ children }) => {
  // The leaving label is only for show.
  const isPresent = useIsPresent()

  return (
    <motion.span
      className="col-start-1 row-start-1"
      aria-hidden={!isPresent || undefined}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: enter }}
      exit={{ opacity: 0, y: -6, transition: exit }}>
      {children}
    </motion.span>
  )
}

export { LabelSwap }
