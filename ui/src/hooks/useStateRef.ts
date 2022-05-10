import { useState, useRef, MutableRefObject } from 'react'

/**
 * Access a state's fresh value. Useful for events.
 */
function useStateRef<T>(defaultValue?: T): [T, (v: T) => void, MutableRefObject<T>] {
  const [state, internalSetState] = useState(defaultValue)
  const stateRef = useRef(defaultValue)
  const setState = (v: T) => {
    stateRef.current = v
    internalSetState(v)
  }
  return [state, setState, stateRef]
}

export { useStateRef }
