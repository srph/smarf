import { useState, useEffect } from 'react'

/**
 * Avoid running the effect on mount.
 */
export const useUpdateEffect: typeof useEffect = (fn, deps) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
      return
    }

    fn()
  }, deps)
}
