import { MutableRefObject, useEffect, useRef } from 'react'

function useLatestValue<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}

export { useLatestValue }
