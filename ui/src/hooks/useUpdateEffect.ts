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

    return fn()
    // Same contract as useEffect: the caller's deps decide when it runs.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // Reset on unmount. StrictMode mounts, unmounts and remounts in development; without this the
  // remount would count as an update and run the effect.
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])
}
