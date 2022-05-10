import { useEffect } from 'react'
import { useLatestValue } from './useLatestValue'

type Listener<T extends keyof WindowEventMap> = (event: WindowEventMap[T]) => void

const useDocumentListener = <T extends keyof WindowEventMap>(event: string, listener: Listener<T>) => {
  const listenerRef = useLatestValue(listener)

  useEffect(() => {
    const handler: Listener<T> = (event) => listenerRef.current(event)
    document.addEventListener(event, handler)
    return () => document.addEventListener(event, handler)
  }, [listenerRef])
}

export { useDocumentListener }
