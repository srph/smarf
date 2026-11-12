import { RefObject, useLayoutEffect, useRef } from 'react'

/** A ref that always holds the latest `value`, for reading from event handlers and subscriptions. */
function useLatestValue<T>(value: T): RefObject<T> {
  const ref = useRef(value)

  useLayoutEffect(() => {
    ref.current = value
  })

  return ref
}

export { useLatestValue }
