import { useEffect } from 'react'

const useInterval = (callback: Function, interval: number) => {
  useEffect(() => {
    const n = setInterval(callback, interval)

    return () => {
      clearInterval(n)
    }
  }, [interval])
}

export { useInterval }
