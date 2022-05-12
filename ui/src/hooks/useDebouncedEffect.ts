import { useRef } from 'react'
import { useUpdateEffect } from '~/src/hooks'

const useDebouncedEffect = (callback: Function, deps: any[], timeout: number) => {
  const timeoutRef = useRef<number>()

  useUpdateEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(callback, timeout)
  }, deps)
}

export { useDebouncedEffect }
