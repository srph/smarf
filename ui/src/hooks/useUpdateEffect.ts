import { useRef, useEffect } from 'react'

/**
 * Avoid running the effect on mount.
 */
export const useUpdateEffect: typeof useEffect = (fn, deps) => {
  const isMountedRef = useRef(false)

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }

    fn()
  }, deps)
}
