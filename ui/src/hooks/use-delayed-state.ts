import { useCallback, useEffect, useState, useRef } from 'react'
import { useLatestValue } from './use-latest-value'

type Callback<T> = (previousValue: T, newValue: T) => boolean

// Time-delays a state update.
// See useToolbarSaveStatus as an example.
// This is helpful for us to maintain the "update" phase for a second longer
// in-case the http requests happen way too fast. If you're interested,
// no you don't need this in your own project. It's the most useless garbage
// feature UX-wise, but I'm doing this show-case the component :)
function useDelayedState<T>(defaultValue: T, callback: Callback<T>, delay: number): [T, (s: T) => void] {
  const [state, internalSetState] = useState<T>(defaultValue)

  // We only call set state after the delay; which means ref value changes neither until then.
  // Otherwise, we will have race conditions.
  // Anyway, I'm still not sure if this works, this fix feels superficial.
  const stateRef = useRef(state)

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const callbackRef = useLatestValue(callback)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  // Stable, like useState's setter, so effects can depend on it.
  const setState = useCallback(
    (nextState: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }

      if (callbackRef.current(stateRef.current, nextState)) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = undefined
          internalSetState(nextState)
        }, delay)
      } else {
        internalSetState(nextState)
      }

      stateRef.current = nextState
    },
    [callbackRef, delay]
  )

  return [state, setState]
}

export { useDelayedState }
