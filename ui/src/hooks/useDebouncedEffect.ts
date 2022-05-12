import { useEffect, useRef } from 'react'

const useDebouncedEffect = (callback: Function, deps: any[], timeout: number) => {
  const timeoutRef = useRef<number>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(callback, timeout)
  }, deps)
}

export { useDebouncedEffect }
