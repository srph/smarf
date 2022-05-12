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
  const timeoutRef = useRef()

  const setState = (newState) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (callback(state, newState)) {
      setTimeout(() => {
        internalSetState(newState)
      }, delay)
    } else {
      internalSetState(newState)
    }
  }

  return [state, setState]
}

export { useDelayedState }
