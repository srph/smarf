import { MutableRefObject, useEffect, useRef } from 'react'

function useLatestValue<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value)

  ref.current = value

  return ref
}

export { useLatestValue }
