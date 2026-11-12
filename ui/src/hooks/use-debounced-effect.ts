import { useRef } from 'react'
import { useUpdateEffect } from '~/src/hooks/use-update-effect'

const useDebouncedEffect = (callback: Function, deps: any[], timeout: number) => {
  const timeoutRef = useRef<number>(undefined)

  useUpdateEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(callback, timeout)
  }, deps)
}

export { useDebouncedEffect }
