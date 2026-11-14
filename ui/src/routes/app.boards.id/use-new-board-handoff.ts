import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { type Transition } from 'motion/react'

/** What /b/new puts in router state when it opens the board it just created. */
interface NewBoardHandoffState {
  newBoard: { start: string }
}

/** The layoutId New Board's "Creating" bar and the dock share, so the dock slides in from where the bar was. */
const NEW_BOARD_DOCK = 'new-board-dock'

/** The bar's slide into the dock's place. */
const NEW_BOARD_SLIDE: Transition = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] }

// Without layout to animate (reduced motion, tests) onLayoutAnimationComplete never comes, so the slide also ends on
// a timer, a little after it would have.
const SLIDE_MS = 750
// ButtonLoader's blur swap (duration-250)
const SWAP_MS = 250

type Stage = 'sliding' | 'swapping' | null

const readStart = (state: unknown) => (state as Partial<NewBoardHandoffState> | null)?.newBoard?.start ?? null

/**
 * The dock's arrival from /b/new, if it came from there: 'sliding' in from the "Creating" bar, then 'swapping' as
 * "Creating …" blurs into the dock's own row, then null. `arrived` holds for the toolbar's life, so the dock's rise
 * never plays for this board. The router state is cleared at the end, so Back, Forward or a refresh can't replay it.
 */
const useNewBoardHandoff = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [start] = useState(() => readStart(location.state))
  const [stage, setStage] = useState<Stage>(start ? 'sliding' : null)

  const slid = () => setStage((current) => (current === 'sliding' ? 'swapping' : current))

  useEffect(() => {
    if (stage !== 'sliding') return
    const timer = setTimeout(() => setStage((current) => (current === 'sliding' ? 'swapping' : current)), SLIDE_MS)
    return () => clearTimeout(timer)
  }, [stage])

  useEffect(() => {
    if (stage !== 'swapping') return
    const timer = setTimeout(() => {
      setStage(null)
      navigate(location.pathname, { replace: true, state: null })
    }, SWAP_MS)
    return () => clearTimeout(timer)
  }, [stage, navigate, location.pathname])

  return { arrived: start !== null, start, stage, slid }
}

export { type NewBoardHandoffState, NEW_BOARD_DOCK, NEW_BOARD_SLIDE, useNewBoardHandoff }
