import { useState, useRef } from 'react'

type Callback<T> = (previousValue: T, newValue: T) => boolean

// Time-delays a state update.
// See ToolbarStatusIndicator as an example.
// This is helpful for us to maintain the "update" phase for a second longer
// in-case the http requests happen way too fast. If you're interested,
// no you don't need this in your own project. It's the most useless garbage
// feature UX-wise, but I'm doing this show-case the component :)
function useDelayedState<T>(defaultValue: T, callback: Callback<T>, delay: number): [T, (s: T) => void] {
  const [state, internalSetState] = useState<T>(defaultValue)

  // We are not using useStateRef here as we need fresher access.
  // We only call set state after the delay; which means ref value changes neither until then.
  // Otherwise, we will have race conditions.
  // Anyway, I'm still not sure if this works, this fix feels superficial.
  const stateRef = useRef(state)

  const timeoutRef = useRef()

  const setState = (nextState: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (callback(stateRef.current, nextState)) {
      setTimeout(() => {
        internalSetState(nextState)
      }, delay)
    } else {
      internalSetState(nextState)
    }

    stateRef.current = nextState
  }

  return [state, setState]
}

export { useDelayedState }
