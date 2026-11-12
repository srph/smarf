import { useEffect } from 'react'
import { useLatestValue } from './useLatestValue'

const useInterval = (callback: () => void, interval: number) => {
  const callbackRef = useLatestValue(callback)

  useEffect(() => {
    const n = setInterval(() => callbackRef.current(), interval)

    return () => {
      clearInterval(n)
    }
  }, [callbackRef, interval])
}

export { useInterval }
