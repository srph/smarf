import { useState, useRef, MutableRefObject } from 'react'

/**
 * Real-time access to a state's value. Useful for possible race conditions / fast operations.
 */
function useStateRef<T>(defaultValue: T): [T, (v: T) => void, MutableRefObject<T>] {
  const [state, internalSetState] = useState(defaultValue)
  const stateRef = useRef(defaultValue)
  const setState = (v: T) => {
    internalSetState(v)
    stateRef.current = v
  }
  return [state, setState, stateRef]
}

export { useStateRef }
